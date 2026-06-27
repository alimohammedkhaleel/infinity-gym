const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ==================== Middleware ====================
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (allowed.some(o => origin.startsWith(o))) return callback(null, true);
    if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL) {
      try {
        const domain = new URL(process.env.CLIENT_URL).hostname;
        if (origin.includes(domain)) return callback(null, true);
      } catch (_) {}
    }
    // Allow all Netlify and Vercel preview domains in production
    if (origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Lazy DB Initializer ====================
let dbReady = false;
let dbError = null;

const initDB = async () => {
  if (dbReady) return;
  if (dbError) throw dbError;

  const { sequelize, defineAssociations } = require('./config/models');
  const seedDatabase = require('./seed-data');

  defineAssociations();

  await sequelize.authenticate();

  const tables = await sequelize.getQueryInterface().showAllTables();
  if (tables.length === 0) {
    await sequelize.sync({ force: true });
  } else {
    await sequelize.sync({ alter: false });
  }

  await seedDatabase();

  // Start cron only when NOT on Vercel (Vercel is stateless per request)
  if (!process.env.VERCEL) {
    const { initCronJobs } = require('./services/cronService');
    initCronJobs();
  }

  dbReady = true;
};

// ==================== DB Init Middleware ====================
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error('DB init error:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable', error: err.message });
  }
});

// ==================== Routes ====================
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Infinity Gym API', dbReady, timestamp: new Date().toISOString() });
});

// Cron trigger
app.get('/api/cron/expire', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { updateExpiredSubscriptions } = require('./services/cronService');
  await updateExpiredSubscriptions();
  res.json({ success: true, message: 'Expiry check done.' });
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

// ==================== Local Dev: Start HTTP Server ====================
if (!process.env.VERCEL) {
  const { initWhatsApp } = require('./services/whatsappService');
  const PORT = process.env.PORT || 5000;

  initDB()
    .then(() => {
      initWhatsApp();
      app.listen(PORT, () => {
        console.log(`🚀 Infinity Gym Server running on port ${PORT}`);
        console.log(`🌐 Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
        console.log(`📊 Admin: admin@infinitygym.com / Admin@123`);
      });
    })
    .catch(err => {
      console.error('❌ Server start failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;
