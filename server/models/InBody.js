const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== InBody Model ====================
const InBody = sequelize.define('InBody', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Weight in kg'
  },
  skeletal_muscle_mass: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Skeletal Muscle Mass in kg'
  },
  body_fat_mass: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Body Fat Mass in kg'
  },
  body_fat_percentage: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: false,
    comment: 'Body Fat Percentage (%)'
  },
  water_percentage: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: false,
    comment: 'Body Water Percentage (%)'
  },
  bmi: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: false,
    comment: 'Body Mass Index (BMI)'
  },
  test_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inbody_logs',
  timestamps: true,
  underscored: true
});

module.exports = InBody;
