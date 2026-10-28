const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getTodayAttendanceCount, 
  getDashboardStats,
  getClassWiseStats,
  markAbsentees,
  getLowAttendanceStudents,
  getTodayAbsentStudents,
  getWeeklyStats // 🚀 Naya import
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scan', protect, markAttendance);
router.get('/today', protect, getTodayAttendanceCount);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/class-stats', protect, getClassWiseStats);
router.post('/mark-absent', protect, markAbsentees);
router.get('/low-attendance', protect, getLowAttendanceStudents);
router.get('/today-absent', protect, getTodayAbsentStudents);
router.get('/weekly-stats', protect, getWeeklyStats); // 🚀 Naya route

module.exports = router;