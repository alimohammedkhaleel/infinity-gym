const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDynamicQR, verifyQR, freezeAccount, unfreezeAccount, getReferrals, getLeaderboard, getMyInBodyHistory
} = require('../controllers/userController');

router.get('/qr-entry', protect, getDynamicQR);
router.post('/verify-qr', verifyQR);            // Reception scanner endpoint
router.post('/freeze', protect, freezeAccount);
router.post('/unfreeze', protect, unfreezeAccount);
router.get('/referrals', protect, getReferrals);
router.get('/leaderboard', getLeaderboard);
router.get('/inbody', protect, getMyInBodyHistory);

module.exports = router;
