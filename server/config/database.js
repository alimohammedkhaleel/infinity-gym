const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// If a DATABASE_URL is provided (typical in production platforms like Render/Railway), use it.
// Otherwise, fall back to individual variables for local development (XAMPP).
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        // Some managed databases require SSL
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        paranoid: false
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'infinity_gym',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          paranoid: false
        }
      }
    );

module.exports = sequelize;
