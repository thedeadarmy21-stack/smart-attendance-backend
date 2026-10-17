const express = require('express');
const router = express.Router();
const { markAttendance, getTodayAttendanceCount } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/attendance/scan (QR Scan karke attendance lagana)
router.post('/scan', protect, markAttendance);

// GET /api/attendance/today (Aaj ka count dekhna)
router.get('/today', protect, getTodayAttendanceCount);

module.exports = router;