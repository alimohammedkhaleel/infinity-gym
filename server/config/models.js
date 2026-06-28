const sequelize = require('./database');

// ==================== Import all models ====================
const User = require('../models/User');
const Referral = require('../models/Referral');
const FreezeLog = require('../models/FreezeLog');
const GymClass = require('../models/GymClass');
const PricePlan = require('../models/PricePlan');
const Schedule = require('../models/Schedule');
const PersonalTraining = require('../models/PersonalTraining');
const InBody = require('../models/InBody');
const Payment = require('../models/Payment');

// ==================== Define Associations ====================
const defineAssociations = () => {
  // User -> Referrals (as referrer)
  User.hasMany(Referral, { foreignKey: 'referrer_id', as: 'referrals_made', onDelete: 'CASCADE' });
  Referral.belongsTo(User, { foreignKey: 'referrer_id', as: 'referrer' });

  // User -> Referrals (as referee)
  User.hasMany(Referral, { foreignKey: 'referee_id', as: 'referred_by_entry', onDelete: 'CASCADE' });
  Referral.belongsTo(User, { foreignKey: 'referee_id', as: 'referee' });

  // User -> FreezeLogs
  User.hasMany(FreezeLog, { foreignKey: 'user_id', as: 'freeze_logs', onDelete: 'CASCADE' });
  FreezeLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User -> InBody
  User.hasMany(InBody, { foreignKey: 'user_id', as: 'inbody_records', onDelete: 'CASCADE' });
  InBody.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User -> Payments
  User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments', onDelete: 'CASCADE' });
  Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  
  // Admin -> Payments (recorded_by)
  User.hasMany(Payment, { foreignKey: 'recorded_by', as: 'recorded_payments', onDelete: 'SET NULL' });
  Payment.belongsTo(User, { foreignKey: 'recorded_by', as: 'admin' });
};

// ==================== Export ====================
module.exports = {
  sequelize,
  User,
  Referral,
  FreezeLog,
  GymClass,
  PricePlan,
  Schedule,
  PersonalTraining,
  InBody,
  Payment,
  defineAssociations
};
