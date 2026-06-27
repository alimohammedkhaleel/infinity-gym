const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== PersonalTraining Model (Dynamic) ====================
const PersonalTraining = sequelize.define('PersonalTraining', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of sessions e.g. 8, 12, 15'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price in EGP'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'personal_training',
  timestamps: true
});

module.exports = PersonalTraining;
