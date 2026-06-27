const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Referral Model ====================
const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referrer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who invited someone'
  },
  referee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who was invited'
  },
  status: {
    type: DataTypes.ENUM('registered', 'active'),
    defaultValue: 'registered',
    comment: 'registered = signed up, active = paid and admin-confirmed'
  }
}, {
  tableName: 'referrals',
  timestamps: true
});

module.exports = Referral;
