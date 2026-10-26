const express = require('express');
const router = express.Router();
const { 
  markTeacherAttendance, 
  getTeacherStats, 
  getTeacherAttendanceReport 
} = require('../controllers/teacherAttendanceController');
const { protect } = require('../middleware/authMiddleware');

// Teacher ki attendance lagana (scan)
router.post('/scan', protect, markTeacherAttendance);

// Dashboard ke liye stats
router.get('/stats', protect, getTeacherStats);

// Attendance report (date ke hisaab se)
router.get('/report', protect, getTeacherAttendanceReport);

module.exports = router;