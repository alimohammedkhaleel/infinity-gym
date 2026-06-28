const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Payment Model ====================
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'المبلغ المدفوع بالجنيه المصري'
  },
  expected_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'المبلغ المتوقع حسب خطة السعر'
  },
  payment_type: {
    type: DataTypes.ENUM('activation', 'renewal', 'extension', 'pt_session'),
    defaultValue: 'activation',
    comment: 'نوع الدفع: تفعيل، تجديد، تمديد، جلسة PT'
  },
  subscription_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'نوع الاشتراك المرتبط بالدفع'
  },
  duration_months: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'عدد الأشهر المدفوعة'
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ الدفع'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'ملاحظات إضافية (مثل: دفع جزئي، خصم، إلخ)'
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الأدمن الذي سجل الدفع'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['payment_date'] },
    { fields: ['payment_type'] }
  ]
});

module.exports = Payment;
