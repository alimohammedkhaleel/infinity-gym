const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

// Import models + associations (NCT System pattern)
const {
  sequelize, defineAssociations,
  User, GymClass, PricePlan, Schedule, PersonalTraining
} = require('./config/models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import seed
const seedDatabase = require('./seed-data');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== Middleware ====================
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, process.env.CLIENT_URL || 'http://localhost:5173');
    }
  },
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Infinity Gym API', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const { initWhatsApp } = require('./services/whatsappService');
const { initCronJobs } = require('./services/cronService');

// ==================== Start Server (NCT System pattern) ====================
const startServer = async () => {
  try {
    // 1. Define associations BEFORE sync
    defineAssociations();
    console.log('✅ Model associations defined.');

    // 2. Test DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected (MySQL).');

    // 3. Sync tables
    const [results] = await sequelize.query('SHOW TABLES');
    if (results.length === 0) {
      await sequelize.sync({ force: true });
      console.log('✅ Database tables created (first run).');
    } else {
      await sequelize.sync({ alter: false });
      console.log('✅ Database tables verified (no schema changes).');
    }

    // 4. Seed default data
    await seedDatabase();

    // 5. Start background services
    initWhatsApp();
    initCronJobs();

    // 6. Start API Server
    app.listen(PORT, () => {
      console.log(`🚀 Infinity Gym Server running on port ${PORT}`);
      console.log(`🌐 Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`📊 Admin: admin@infinitygym.com / Admin@123`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
    process.exit(1);
  }
};

startServer();
module.exports = app;
