const express = require('express');
const router = express.Router();
const { 
  markTeacherAttendance, 
  getTeacherStats, 
  getTeacherAttendanceReport,
  deleteTeacher,
  getTeacherHistory
} = require('../controllers/teacherAttendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Attendance Routes
router.post('/scan', protect, adminOnly, markTeacherAttendance);
router.get('/stats', protect, adminOnly, getTeacherStats);
router.get('/report', protect, adminOnly, getTeacherAttendanceReport);

// 🚀 NAYA: Teacher Management Routes
router.delete('/delete/:id', protect, adminOnly, deleteTeacher);
router.get('/history/:id', protect, adminOnly, getTeacherHistory);

module.exports = router;