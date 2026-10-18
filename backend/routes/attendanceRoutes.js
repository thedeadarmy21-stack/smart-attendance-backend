const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getTodayAttendanceCount, 
  getDashboardStats 
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/attendance/scan (QR Scan karke attendance lagana)
router.post('/scan', protect, markAttendance);

// GET /api/attendance/today (Teacher App ke liye aaj ka count)
router.get('/today', protect, getTodayAttendanceCount);

// GET /api/attendance/dashboard-stats (Admin Dashboard ke liye full stats)
router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;