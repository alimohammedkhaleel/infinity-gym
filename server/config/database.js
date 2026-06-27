const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Explicitly require pg so Vercel serverless bundles it correctly
// (Sequelize loads it dynamically, which Vercel's bundler misses)
require('pg');
require('pg-hstore');

dotenv.config();

// If a DATABASE_URL is provided (typical in production platforms like Render/Netlify), use it.
// Dynamically detect dialect based on connection string (Netlify Database uses Postgres)
const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: isPostgres ? 'postgres' : 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        // Neon / Render databases require SSL
        ssl: isPostgres ? {
          require: true,
          rejectUnauthorized: false
        } : false
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
