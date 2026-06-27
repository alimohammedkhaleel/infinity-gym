/**
 * Cron Jobs — Infinity Gym
 *
 * Jobs:
 *  1. [CRITICAL] Every hour  — mark expired subscriptions as 'expired'
 *  2. Daily 10:00 AM         — WhatsApp expiry reminders (3 days before)
 *  3. Daily 10:05 AM         — WhatsApp motivation messages
 */

let cron;
try { cron = require('node-cron'); } catch {
  console.log('ℹ️  node-cron not installed — scheduled jobs disabled.');
  module.exports = { initCronJobs: () => {} };
  return;
}

const { User } = require('../config/models');
const { Op }   = require('sequelize');
const whatsapp = require('./whatsappService');

// ─── helper ────────────────────────────────────────────────────────────────
const updateExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    // Members whose subscription_end has passed but still marked active/frozen
    const [count] = await User.update(
      { status: 'expired', is_frozen: false },
      {
        where: {
          role: 'member',
          status: { [Op.in]: ['active', 'frozen'] },
          subscription_end: {
            [Op.and]: [
              { [Op.lt]: now },
              { [Op.ne]: null }
            ]
          }
        }
      }
    );

    if (count > 0) console.log(`⏰ Cron: marked ${count} subscription(s) as expired.`);
  } catch (err) {
    console.error('❌ Cron expiry update error:', err.message);
  }
};

// ─── init ──────────────────────────────────────────────────────────────────
const initCronJobs = () => {

  // 1. Subscription expiry — runs every hour (and once immediately on startup)
  updateExpiredSubscriptions(); // run once immediately at startup
  cron.schedule('0 * * * *', updateExpiredSubscriptions);
  console.log('✅ Cron: subscription expiry job active (hourly).');

  // 2. WhatsApp reminders — daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    if (!whatsapp.getStatus().isConnected) return;

    try {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      const start = new Date(threeDaysLater); start.setHours(0, 0, 0, 0);
      const end   = new Date(threeDaysLater); end.setHours(23, 59, 59, 999);

      const expiring = await User.findAll({
        where: { role: 'member', status: 'active', subscription_end: { [Op.between]: [start, end] } }
      });

      for (const u of expiring) {
        const msg = `⚠️ تنبيه: اشتراكك في Infinity Gym ينتهي خلال 3 أيام (${new Date(u.subscription_end).toLocaleDateString('ar-EG')}). تواصل معنا لتجديده! 💚`;
        await whatsapp.sendMessage(u.phone, msg);
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) { console.error('❌ WA expiry reminder error:', err.message); }
  });

  // 3. Daily motivation — 10:05 AM
  cron.schedule('5 10 * * *', async () => {
    if (!whatsapp.getStatus().isConnected) return;

    const msgs = [
      '🌟 أنت أقوى مما تظن! كل تمرين يقربك من نسخة أفضل. Infinity Gym معك 💪',
      '🔥 لا تتوقف عندما تتعب، توقف عندما تنتهي! ننتظرك في Infinity Gym.',
      '💪 استمر في العمل الشاق! نتائج اليوم هي مجهود الأمس. من Infinity Gym 🏋️'
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    try {
      const active = await User.findAll({ where: { role: 'member', status: 'active' } });
      for (const u of active) {
        await whatsapp.sendMessage(u.phone, `مرحباً ${u.full_name}،\n${msg}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) { console.error('❌ WA motivation error:', err.message); }
  });
};

module.exports = { initCronJobs, updateExpiredSubscriptions };
