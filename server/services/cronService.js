const cron = require('node-cron');
const { User } = require('../config/models');
const { Op } = require('sequelize');
const whatsappService = require('./whatsappService');

const initCronJobs = () => {
  // Run everyday at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('🕒 Running daily WhatsApp reminders cron job...');
    try {
      if (!whatsappService.getStatus().isConnected) {
        console.log('⚠️ WhatsApp not connected. Skipping cron job.');
        return;
      }

      // 1. Expiry Reminders (Expiring in 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const expiringUsers = await User.findAll({
        where: {
          role: 'member',
          status: 'active',
          subscription_end: {
            [Op.between]: [
              new Date(threeDaysFromNow.setHours(0,0,0,0)), 
              new Date(threeDaysFromNow.setHours(23,59,59,999))
            ]
          }
        }
      });

      for (const user of expiringUsers) {
        const msg = `⚠️ تنبيه: اشتراكك في Infinity Gym على وشك الانتهاء خلال 3 أيام (${new Date(user.subscription_end).toLocaleDateString('ar-EG')}). تواصل معنا لتجديده والاستمرار في رحلتك الرياضية! 💚`;
        await whatsappService.sendMessage(user.phone, msg);
        await new Promise(res => setTimeout(res, 2000));
      }

      // 2. Active Users Daily Motivation
      const activeUsers = await User.findAll({
        where: { role: 'member', status: 'active' }
      });

      const motivations = [
        '🌟 أنت أقوى مما تظن! كل تمرين يقربك من نسخة أفضل منك. Infinity Gym معك في كل خطوة 💪',
        '🔥 لا تتوقف عندما تتعب، توقف عندما تنتهي! ننتظرك اليوم في Infinity Gym.',
        '💪 استمر في العمل الشاق! نتائج اليوم هي مجهود الأمس. نهارك سعيد من Infinity Gym.'
      ];
      
      const randomMsg = motivations[Math.floor(Math.random() * motivations.length)];

      for (const user of activeUsers) {
        await whatsappService.sendMessage(user.phone, `مرحباً كابتن ${user.full_name}،\n${randomMsg}`);
        // Delay slightly to prevent ban
        await new Promise(res => setTimeout(res, 2000));
      }

    } catch (err) {
      console.error('❌ Error in cron job:', err);
    }
  });
};

module.exports = { initCronJobs };
