const { User, Referral, GymClass, PricePlan, Schedule, PersonalTraining, InBody, Payment } = require('../config/models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const jwt = require('jsonwebtoken');

// ==================== GET /api/admin/members ====================
exports.getMembers = async (req, res) => {
  try {
    const members = await User.findAll({
      where: { role: 'member', status: { [Op.ne]: 'pending_migration' } },
      attributes: { exclude: ['password_hash', 'device_fingerprint'] },
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ success: true, members });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PUT /api/admin/members/:id/activate ====================
exports.activateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription_type, gym_class_id, duration_months, amount_paid, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });

    const start = new Date();
    // Use exact days (30 per month) for dynamic accuracy
    const daysToAdd = parseInt(duration_months) * 30;
    const end = new Date(start);
    end.setDate(end.getDate() + daysToAdd);

    const updateData = {
      status: 'active',
      is_active: true,
      subscription_start: start,
      subscription_end: end,
      subscription_type: subscription_type || 'general'
    };

    // If admin provided a new password, update it (model hook will hash it)
    if (password && password.trim().length >= 6) {
      updateData.password_hash = password.trim();
    }

    await user.update(updateData);

    // Record payment if amount_paid is provided
    if (amount_paid && parseFloat(amount_paid) > 0) {
      await Payment.create({
        user_id: id,
        amount_paid: parseFloat(amount_paid),
        expected_amount: req.body.expected_price || null,
        payment_type: 'activation',
        duration_months: parseInt(duration_months),
        notes: `تفعيل/تمديد اشتراك — ${subscription_type}`,
        payment_date: new Date()
      });
    }

    // Activate referral if exists
    await Referral.update(
      { status: 'active' },
      { where: { referee_id: id, status: 'registered' } }
    );

    return res.status(200).json({
      success: true,
      message: `✅ تم تفعيل الاشتراك بنجاح. ينتهي في ${end.toLocaleDateString('ar-EG')}`,
      user,
      amount_paid: amount_paid || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FREEZE / UNFREEZE / DELETE MEMBERS ====================
exports.freezeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration_days } = req.body;
    
    if (!duration_days || isNaN(duration_days) || duration_days <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid duration specified.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });
    
    if (user.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active members can be frozen.' });
    }

    // Extend subscription end by the freeze duration
    let newEnd = user.subscription_end ? new Date(user.subscription_end) : new Date();
    newEnd.setDate(newEnd.getDate() + parseInt(duration_days));

    await user.update({
      status: 'frozen',
      is_frozen: true,
      subscription_end: newEnd
    });
    
    // Log freeze action if needed
    const { FreezeLog } = require('../config/models');
    if (FreezeLog) {
      await FreezeLog.create({
        user_id: user.id,
        freeze_start: new Date(),
        freeze_end: new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000),
        days_consumed: parseInt(duration_days)
      });
    }

    return res.status(200).json({ success: true, message: `✅ تم تجميد الاشتراك بنجاح. ينتهي الآن في ${newEnd.toLocaleDateString('ar-EG')}`, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.unfreezeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });

    const { FreezeLog } = require('../config/models');
    let updatedEnd = user.subscription_end ? new Date(user.subscription_end) : null;
    
    if (FreezeLog && updatedEnd) {
      // Find the most recent freeze log for this user
      const lastFreeze = await FreezeLog.findOne({
        where: { user_id: id },
        order: [['createdAt', 'DESC']]
      });

      if (lastFreeze && lastFreeze.freeze_end && lastFreeze.freeze_end > new Date()) {
        // Calculate the unused days (difference between expected freeze end and now)
        const now = new Date();
        const unusedMs = lastFreeze.freeze_end.getTime() - now.getTime();
        const unusedDays = Math.ceil(unusedMs / (1000 * 60 * 60 * 24));
        
        if (unusedDays > 0) {
          // Deduct unused days from subscription end
          updatedEnd.setDate(updatedEnd.getDate() - unusedDays);
          
          // Update the log
          await lastFreeze.update({
            freeze_end: now,
            days_consumed: lastFreeze.days_consumed - unusedDays
          });
        }
      }
    }

    await user.update({
      status: 'active',
      is_frozen: false,
      ...(updatedEnd ? { subscription_end: updatedEnd } : {})
    });

    return res.status(200).json({ success: true, message: '✅ تم تفعيل الاشتراك المجمد بنجاح.', user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });
    
    await user.destroy();
    return res.status(200).json({ success: true, message: '🗑️ تم حذف المستخدم بنجاح.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ==================== MIGRATION ENDPOINTS ====================
exports.generateMigrationToken = async (req, res) => {
  try {
    const { expiresIn } = req.body; // e.g., '24h', '5d', '7d'
    const token = jwt.sign({ purpose: 'migration' }, process.env.JWT_SECRET, { expiresIn: expiresIn || '24h' });
    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingMigrations = async (req, res) => {
  try {
    const members = await User.findAll({
      where: { status: 'pending_migration' },
      order: [['created_at', 'DESC']]
    });
    return res.status(200).json({ success: true, members });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveMigration = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });

    // The user already chose their own password during migration form.
    // Just activate — no need to override the password.
    await user.update({
      status: 'active',
      is_active: true
    });

    return res.status(200).json({
      success: true,
      message: `✅ تم تفعيل حساب ${user.full_name}. يمكنه الدخول بـ Gym ID: ${user.gym_id} وكلمة المرور التي اختارها.`,
      gym_id: user.gym_id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET /api/admin/leaderboard ====================
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Referral.findAll({
      where: { status: 'active' },
      attributes: ['referrer_id', [sequelize.fn('COUNT', sequelize.col('referrer_id')), 'points']],
      group: ['referrer_id', 'referrer.id', 'referrer.full_name', 'referrer.gym_id', 'referrer.gender'],
      include: [{ model: User, as: 'referrer', attributes: ['full_name', 'gym_id', 'gender'] }],
      order: [[sequelize.literal('points'), 'DESC']],
      limit: 20
    });
    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET /api/admin/stats ====================
exports.getStats = async (req, res) => {
  try {
    const totalMembers = await User.count({ where: { role: 'member' } });
    const activeMembers = await User.count({ where: { role: 'member', status: 'active' } });
    const totalClasses = await GymClass.count({ where: { is_active: true } });
    const weeklyClasses = await Schedule.count({ where: { is_active: true } });
    const totalRevenue = await Payment.sum('amount_paid') || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        totalClasses,
        weeklySchedules: weeklyClasses,
        totalRevenue
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PRICE PLANS CRUD ====================
exports.getPricePlans = async (req, res) => {
  try {
    const plans = await PricePlan.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] });
    return res.status(200).json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePricePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PricePlan.findByPk(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    await plan.update(req.body);
    return res.status(200).json({ success: true, message: 'Price updated.', plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPricePlan = async (req, res) => {
  try {
    const plan = await PricePlan.create(req.body);
    return res.status(201).json({ success: true, plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePricePlan = async (req, res) => {
  try {
    const { id } = req.params;
    await PricePlan.update({ is_active: false }, { where: { id } });
    return res.status(200).json({ success: true, message: 'Plan deactivated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SCHEDULES CRUD ====================
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] });
    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    await schedule.update(req.body);
    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    return res.status(201).json({ success: true, schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.update({ is_active: false }, { where: { id } });
    return res.status(200).json({ success: true, message: 'Schedule deactivated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GYM CLASSES CRUD ====================
exports.getClasses = async (req, res) => {
  try {
    const classes = await GymClass.findAll({ where: { is_active: true } });
    return res.status(200).json({ success: true, classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const gymClass = await GymClass.create(req.body);
    return res.status(201).json({ success: true, gymClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const gymClass = await GymClass.findByPk(id);
    if (!gymClass) return res.status(404).json({ success: false, message: 'Class not found.' });
    await gymClass.update(req.body);
    return res.status(200).json({ success: true, gymClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await GymClass.update({ is_active: false }, { where: { id } });
    return res.status(200).json({ success: true, message: 'Class deactivated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PERSONAL TRAINING CRUD ====================
exports.getPTPlans = async (req, res) => {
  try {
    const plans = await PersonalTraining.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] });
    return res.status(200).json({ success: true, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePTplan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PersonalTraining.findByPk(id);
    if (!plan) return res.status(404).json({ success: false, message: 'PT plan not found.' });
    await plan.update(req.body);
    return res.status(200).json({ success: true, plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPTplan = async (req, res) => {
  try {
    const plan = await PersonalTraining.create(req.body);
    return res.status(201).json({ success: true, plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePTplan = async (req, res) => {
  try {
    const { id } = req.params;
    await PersonalTraining.update({ is_active: false }, { where: { id } });
    return res.status(200).json({ success: true, message: 'PT plan deactivated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== INBODY CRUD ====================
exports.addInBodyRecord = async (req, res) => {
  try {
    const { user_id, weight, skeletal_muscle_mass, body_fat_mass, body_fat_percentage, water_percentage, bmi, test_date } = req.body;
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ success: false, message: 'Member not found.' });

    const record = await InBody.create({
      user_id, weight, skeletal_muscle_mass, body_fat_mass,
      body_fat_percentage, water_percentage, bmi,
      test_date: test_date || new Date()
    });
    return res.status(201).json({ success: true, record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMemberInBodyHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const records = await InBody.findAll({
      where: { user_id: id },
      order: [['test_date', 'DESC']]
    });
    return res.status(200).json({ success: true, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInBodyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await InBody.destroy({ where: { id } });
    return res.status(200).json({ success: true, message: 'InBody record deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
