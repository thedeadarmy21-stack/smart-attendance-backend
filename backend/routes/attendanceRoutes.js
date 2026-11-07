const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  markManualAttendance,
  getStudentsByClass,
  searchStudent,
  getTodayAttendanceCount, 
  getDashboardStats,
  getClassWiseStats,
  markAbsentees,
  getLowAttendanceStudents,
  getTodayAbsentStudents,
  getWeeklyStats
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// QR Scan
router.post('/scan', protect, markAttendance);

// 🚀 Manual Attendance (2 Options)
router.post('/manual-mark', protect, markManualAttendance); // Mark attendance manually
router.get('/students-by-class', protect, getStudentsByClass); // Option 1: Class se list dekho
router.get('/search-student', protect, searchStudent); // Option 2: Roll No/Name se search karo

// Other Routes
router.get('/today', protect, getTodayAttendanceCount);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/class-stats', protect, getClassWiseStats);
router.post('/mark-absent', protect, markAbsentees);
router.get('/low-attendance', protect, getLowAttendanceStudents);
router.get('/today-absent', protect, getTodayAbsentStudents);
router.get('/weekly-stats', protect, getWeeklyStats);

module.exports = router;