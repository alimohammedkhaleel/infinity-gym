const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== GymClass Model (Dynamic - Admin manages) ====================
const GymClass = sequelize.define('GymClass', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g. Cardio, Aerobics, Spa, Sauna, Yoga'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'both'),
    defaultValue: 'both',
    comment: 'Which gender this class is available for'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Emoji or icon identifier'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'gym_classes',
  timestamps: true
});

module.exports = GymClass;
