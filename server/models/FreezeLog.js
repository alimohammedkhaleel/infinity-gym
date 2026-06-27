const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== FreezeLog Model ====================
const FreezeLog = sequelize.define('FreezeLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  freeze_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  freeze_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  days_consumed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'freeze_logs',
  timestamps: true
});

module.exports = FreezeLog;
