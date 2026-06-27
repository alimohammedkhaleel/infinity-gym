const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Schedule Model (Dynamic - Admin manages) ====================
const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  day_group: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g. Saturday-Thursday, Friday'
  },
  time_from: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'e.g. 05:00 PM'
  },
  time_to: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'e.g. 12:00 AM'
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Optional label e.g. Morning Shift'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'schedules',
  timestamps: true
});

module.exports = Schedule;
