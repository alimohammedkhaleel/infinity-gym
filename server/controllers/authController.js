const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Referral } = require('../config/models');
const { Op } = require('sequelize');
const crypto = require('crypto');

// ==================== Generate Gym ID (race-condition safe) ====================
// Uses MAX(id) + random suffix instead of COUNT to avoid duplicate IDs
// under concurrent registrations.
const generateGymId = async () => {
  const sequelize = require('../config/database');
  const [rows] = await sequelize.query('SELECT MAX(id) as maxId FROM users');
  const nextNum = (rows[0]?.maxId ?? 0) + 1;
  // Add a short random hex suffix to guarantee uniqueness even on collision
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `GYM-${String(nextNum).padStart(4, '0')}-${suffix}`;
};

// ==================== Generate JWT ====================
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, gym_id: user.gym_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// ==================== POST /api/auth/register ====================
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password, gender, device_fingerprint, referral_code } = req.body;

    // --- Anti-Fraud: 1 Device = 1 Account ---
    if (device_fingerprint) {
      const existing = await User.findOne({ where: { device_fingerprint } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: '⛔ Sorry, this device is already registered to an account!'
        });
      }
    }

    // --- Check duplicate email / phone ---
    const dup = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
    if (dup) {
      return res.status(400).json({ success: false, message: 'Email or phone already registered.' });
    }

    // --- Generate Gym ID ---
    const gym_id = await generateGymId();

    // --- Handle referral ---
    let referrerId = null;
    if (referral_code) {
      const referrer = await User.findOne({ where: { referral_code } });
      if (referrer) referrerId = referrer.id;
    }

    // --- Create User ---
    const user = await User.create({
      full_name, email, phone,
      password_hash: password,
      gender, gym_id,
      device_fingerprint,
      role: 'member',
      status: 'inactive'
    });

    // --- Create referral record ---
    if (referrerId) {
      await Referral.create({
        referrer_id: referrerId,
        referee_id: user.id,
        status: 'registered'
      });
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: `🎉 Welcome to Infinity Gym! Your Gym ID is ${gym_id}`,
      token,
      user: {
        id: user.id, gym_id: user.gym_id, full_name: user.full_name,
        email: user.email, phone: user.phone, gender: user.gender,
        role: user.role, status: user.status, referral_code: user.referral_code,
        subscription_start: user.subscription_start,
        subscription_end: user.subscription_end,
        is_frozen: user.is_frozen
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
  }
};

// ==================== POST /api/auth/login ====================
exports.login = async (req, res) => {
  try {
    const { gym_id, email, password, device_fingerprint } = req.body;

    const whereClause = gym_id ? { gym_id } : { email };
    const user = await User.findOne({ where: whereClause });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or account disabled.' });
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login & fingerprint
    await user.update({
      last_login: new Date(),
      device_fingerprint: device_fingerprint || user.device_fingerprint
    });

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `💪 Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id, gym_id: user.gym_id, full_name: user.full_name,
        email: user.email, phone: user.phone, gender: user.gender,
        role: user.role, status: user.status, referral_code: user.referral_code,
        subscription_start: user.subscription_start,
        subscription_end: user.subscription_end,
        is_frozen: user.is_frozen
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

// ==================== GET /api/auth/me ====================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'device_fingerprint'] }
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== POST /api/auth/migrate ====================
// الرابط multi-use — يمكن أي عدد من المشتركين استخدامه طالما لم تنتهِ صلاحيته
exports.submitMigration = async (req, res) => {
  try {
    const { token, full_name, phone, gender, subscription_end, password } = req.body;

    // 1. Verify token (only checks expiry — intentionally multi-use)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.purpose !== 'migration') throw new Error('wrong purpose');
    } catch (err) {
      return res.status(400).json({ success: false, message: 'رابط التسجيل منتهي الصلاحية أو غير صالح. اطلب رابطاً جديداً من الاستقبال.' });
    }

    // 2. Validate password
    if (!password || password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
    }

    // 3. Check duplicate phone
    const dup = await User.findOne({ where: { phone } });
    if (dup) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف هذا مسجل بالفعل. إذا نسيت بياناتك تواصل مع الاستقبال.'
      });
    }

    // 4. Generate Gym ID
    const gym_id = await generateGymId();

    // 5. Create user with chosen password (hashed by beforeCreate hook)
    await User.create({
      full_name,
      phone,
      gender,
      gym_id,
      email: `migration_${gym_id.toLowerCase()}@pending.local`,
      password_hash: password.trim(),          // hook will bcrypt this
      subscription_end: subscription_end ? new Date(subscription_end) : null,
      status: 'pending_migration',
      role: 'member',
      is_active: false
    });

    return res.status(201).json({
      success: true,
      gym_id,
      message: 'تم إرسال طلبك للإدارة بنجاح. سيتم تفعيل حسابك قريباً.'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ success: false, message: 'فشل إرسال الطلب.', error: error.message });
  }
};
