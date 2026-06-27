const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const whatsappService = require('../services/whatsappService');

// ---- Stats (Public) ----
router.get('/stats', admin.getStats);

// ---- Members ----
router.get('/members', protect, adminOnly, admin.getMembers);
router.put('/members/:id/activate', protect, adminOnly, admin.activateMember);

// ---- Migration ----
router.post('/migration/token', protect, adminOnly, admin.generateMigrationToken);
router.get('/migration/pending', protect, adminOnly, admin.getPendingMigrations);
router.put('/migration/:id/approve', protect, adminOnly, admin.approveMigration);

// ---- Leaderboard ----
router.get('/leaderboard', admin.getLeaderboard); // Public read

// ---- Price Plans (Dynamic) ----
router.get('/price-plans', admin.getPricePlans);                          // Public
router.post('/price-plans', protect, adminOnly, admin.createPricePlan);
router.put('/price-plans/:id', protect, adminOnly, admin.updatePricePlan);
router.delete('/price-plans/:id', protect, adminOnly, admin.deletePricePlan);

// ---- Schedules (Dynamic) ----
router.get('/schedules', admin.getSchedules);                            // Public
router.post('/schedules', protect, adminOnly, admin.createSchedule);
router.put('/schedules/:id', protect, adminOnly, admin.updateSchedule);
router.delete('/schedules/:id', protect, adminOnly, admin.deleteSchedule);

// ---- Gym Classes (Dynamic) ----
router.get('/classes', admin.getClasses);                                // Public
router.post('/classes', protect, adminOnly, admin.createClass);
router.put('/classes/:id', protect, adminOnly, admin.updateClass);
router.delete('/classes/:id', protect, adminOnly, admin.deleteClass);

// ---- Personal Training Plans (Dynamic) ----
router.get('/pt-plans', admin.getPTPlans);                               // Public
router.post('/pt-plans', protect, adminOnly, admin.createPTplan);
router.put('/pt-plans/:id', protect, adminOnly, admin.updatePTplan);
router.delete('/pt-plans/:id', protect, adminOnly, admin.deletePTplan);

// ---- InBody (Admin) ----
router.post('/members/:id/inbody', protect, adminOnly, admin.addInBodyRecord);
router.get('/members/:id/inbody', protect, adminOnly, admin.getMemberInBodyHistory);
router.delete('/inbody/:id', protect, adminOnly, admin.deleteInBodyRecord);

// ---- WhatsApp Bot ----
router.get('/whatsapp/status', protect, adminOnly, (req, res) => {
  res.json({ success: true, ...whatsappService.getStatus() });
});

router.post('/whatsapp/reconnect', protect, adminOnly, (req, res) => {
  // Restart the service by requiring to re-init (Note: our service handles disconnects by auto-reinitializing, but we can call initWhatsApp here if we want)
  res.json({ success: true, message: 'WhatsApp is restarting...' });
});

module.exports = router;
