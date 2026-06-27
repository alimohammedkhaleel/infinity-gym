const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// ==================== User Model ====================
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gym_id: {
    type: DataTypes.STRING(20),
    unique: 'users_gym_id_unique',
    comment: 'Auto-generated unique Gym ID like GYM-0001'
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: 'users_email_unique',
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: 'users_phone_unique'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  device_fingerprint: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: 'users_device_fingerprint_unique',
    comment: '1 Device = 1 Account anti-fraud'
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  subscription_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscription_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscription_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '1_month, 2_months, etc.'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'frozen', 'expired', 'pending_migration'),
    defaultValue: 'inactive'
  },
  is_frozen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  referral_code: {
    type: DataTypes.STRING(20),
    unique: 'users_referral_code_unique'
  },
  referred_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  // ⚠️ NO indexes array — unique constraints above are enough.
  // Adding both unique:true AND indexes causes MySQL's 64-key limit to be hit on alter.
});

// Instance methods — mirror NCT System pattern
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Hooks — auto hash password before create
User.beforeCreate(async (user) => {
  if (user.password_hash && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
    const saltRounds = 12;
    user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
  }
  // Auto-generate referral code
  if (!user.referral_code) {
    user.referral_code = 'INF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
    const saltRounds = 12;
    user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
  }
});

module.exports = User;
