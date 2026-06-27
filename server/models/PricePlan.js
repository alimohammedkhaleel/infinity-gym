const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== PricePlan Model (Dynamic - Admin manages) ====================
const PricePlan = sequelize.define('PricePlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  label: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g. 1 Month, 3 Months'
  },
  duration_months: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of months the plan covers'
  },
  price_male: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price in EGP for males'
  },
  price_female: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price in EGP for females'
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
  tableName: 'price_plans',
  timestamps: true
});

module.exports = PricePlan;
