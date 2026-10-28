const express = require('express');
const router = express.Router();
const { sendBroadcast, getBroadcastHistory } = require('../controllers/broadcastController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Message bhejein
router.post('/send', protect, adminOnly, sendBroadcast);

// History dekhein
router.get('/history', protect, adminOnly, getBroadcastHistory);

module.exports = router;