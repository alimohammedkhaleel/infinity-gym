const crypto = require('crypto');
const QRCode = require('qrcode');
const { User, FreezeLog, Referral, InBody } = require('../config/models');
const { Op } = require('sequelize');

// ==================== GET /api/user/qr-entry ====================
// Dynamic QR that refreshes every 60 seconds (TOTP logic)
exports.getDynamicQR = async (req, res) => {
  try {
    const user = req.user;

    // TOTP: 60-second time window
    const timeWindow = Math.floor(Date.now() / 1000 / 60);
    const secret = process.env.QR_SECRET || 'infinity_gym_secret_2024';

    const payload = crypto
      .createHmac('sha256', secret)
      .update(`${user.id}:${user.gym_id}:${timeWindow}`)
      .digest('hex');

    const qrData = JSON.stringify({
      user_id: user.id,
      gym_id: user.gym_id,
      token: payload,
      window: timeWindow
    });

    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#0a0a0a', light: '#39ff14' }
    });

    return res.status(200).json({
      success: true,
      qr: qrImage,
      expires_in: 60 - (Math.floor(Date.now() / 1000) % 60)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== POST /api/user/verify-qr (Reception) ====================
exports.verifyQR = async (req, res) => {
  try {
    const { qr_data } = req.body;
    const parsed = JSON.parse(qr_data);
    const currentWindow = Math.floor(Date.now() / 1000 / 60);

    // Reject if older than 1 window (60 seconds)
    if (Math.abs(currentWindow - parsed.window) > 1) {
      return res.status(400).json({ success: false, message: '⛔ انتهت صلاحية الكود. اطلب من العضو تجديده.' });
    }

    const secret = process.env.QR_SECRET || 'infinity_gym_secret_2024';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${parsed.user_id}:${parsed.gym_id}:${parsed.window}`)
      .digest('hex');

    if (expected !== parsed.token) {
      return res.status(400).json({ success: false, message: '⛔ كود QR غير صالح.' });
    }

    const user = await User.findByPk(parsed.user_id, {
      attributes: ['id', 'full_name', 'gym_id', 'status', 'subscription_end', 'gender', 'is_frozen']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '⛔ العضو غير موجود.' });
    }

    // Check subscription_end explicitly — don't rely only on status field
    const now = new Date();
    if (user.subscription_end && new Date(user.subscription_end) < now) {
      // Auto-update status if stale
      await User.update({ status: 'expired', is_frozen: false }, { where: { id: user.id } });
      return res.status(400).json({
        success: false,
        message: `⛔ انتهى اشتراك ${user.full_name} في ${new Date(user.subscription_end).toLocaleDateString('ar-EG')}.`
      });
    }

    if (user.is_frozen || user.status === 'frozen') {
      return res.status(400).json({
        success: false,
        message: `❄️ حساب ${user.full_name} مجمد حالياً.`
      });
    }

    if (user.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `⛔ اشتراك ${user.full_name} غير نشط (${user.status}).`
      });
    }

    const daysLeft = Math.ceil((new Date(user.subscription_end) - now) / (1000 * 60 * 60 * 24));

    return res.status(200).json({
      success: true,
      message: `✅ مرحباً ${user.full_name}!`,
      member: user,
      days_left: daysLeft
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== POST /api/user/freeze ====================
exports.freezeAccount = async (req, res) => {
  try {
    const user = req.user;

    if (user.is_frozen) {
      return res.status(400).json({ success: false, message: 'Account is already frozen.' });
    }
    if (user.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active subscriptions can be frozen.' });
    }

    // Check 7-day limit per 3-month window
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const freezeLogs = await FreezeLog.findAll({
      where: { user_id: user.id, created_at: { [Op.gte]: threeMonthsAgo } }
    });

    const totalDaysUsed = freezeLogs.reduce((sum, log) => sum + (log.days_consumed || 0), 0);
    if (totalDaysUsed >= 7) {
      return res.status(400).json({
        success: false,
        message: `You have used all 7 freeze days for this 3-month period. (${totalDaysUsed}/7 days used)`
      });
    }

    await FreezeLog.create({ user_id: user.id, freeze_start: new Date(), days_consumed: 0 });
    await user.update({ is_frozen: true, status: 'frozen' });

    return res.status(200).json({ success: true, message: '❄️ Account frozen successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== POST /api/user/unfreeze ====================
exports.unfreezeAccount = async (req, res) => {
  try {
    const user = req.user;
    if (!user.is_frozen) {
      return res.status(400).json({ success: false, message: 'Account is not frozen.' });
    }

    const activeLog = await FreezeLog.findOne({
      where: { user_id: user.id, freeze_end: null },
      order: [['created_at', 'DESC']]
    });

    if (activeLog) {
      const freezeEnd = new Date();
      const diffMs = freezeEnd - activeLog.freeze_start;
      const daysConsumed = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      await activeLog.update({ freeze_end: freezeEnd, days_consumed: daysConsumed });

      // Extend subscription by frozen days
      const newEnd = new Date(user.subscription_end);
      newEnd.setDate(newEnd.getDate() + daysConsumed);
      await user.update({ is_frozen: false, status: 'active', subscription_end: newEnd });
    }

    return res.status(200).json({ success: true, message: '✅ Account unfrozen. Subscription extended.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET /api/user/referrals ====================
exports.getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.findAll({
      where: { referrer_id: req.user.id },
      include: [{ model: User, as: 'referee', attributes: ['full_name', 'gym_id', 'status', 'created_at'] }],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, referrals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET /api/user/leaderboard ====================
exports.getLeaderboard = async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const leaderboard = await Referral.findAll({
      attributes: [
        'referrer_id',
        [sequelize.fn('COUNT', sequelize.col('Referral.id')), 'referral_count']
      ],
      include: [
        {
          model: User,
          as: 'referrer',
          attributes: ['full_name', 'gym_id', 'gender']
        }
      ],
      group: ['referrer_id', 'referrer.id'],
      order: [[sequelize.literal('referral_count'), 'DESC']],
      limit: 10
    });

    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET /api/user/inbody ====================
exports.getMyInBodyHistory = async (req, res) => {
  try {
    const records = await InBody.findAll({
      where: { user_id: req.user.id },
      order: [['test_date', 'DESC']]
    });
    return res.status(200).json({ success: true, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
