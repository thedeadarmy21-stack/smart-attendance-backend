const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getTodayAttendanceCount, 
  getDashboardStats,
  getClassWiseStats, // 👈 Naya import
  markAbsentees      // 👈 Naya import
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/attendance/scan (QR Scan karke attendance lagana)
router.post('/scan', protect, markAttendance);

// GET /api/attendance/today (Teacher App ke liye aaj ka count)
router.get('/today', protect, getTodayAttendanceCount);

// GET /api/attendance/dashboard-stats (Admin Dashboard ke liye full stats)
router.get('/dashboard-stats', protect, getDashboardStats);

// 🚀 NAYA ROUTE: Class-wise stats (Kis class me kitne present/absent)
router.get('/class-stats', protect, getClassWiseStats);

// 🚀 NAYA ROUTE: Mark unscanned students as absent
router.post('/mark-absent', protect, markAbsentees);

module.exports = router;