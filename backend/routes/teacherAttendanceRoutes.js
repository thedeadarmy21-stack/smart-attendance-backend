const express = require('express');
const router = express.Router();
const { 
  markTeacherAttendance, 
  getTeacherStats, 
  getTeacherAttendanceReport 
} = require('../controllers/teacherAttendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // ✅ adminOnly import

// Sirf admin hi teacher ki attendance laga sakta hai
router.post('/scan', protect, adminOnly, markTeacherAttendance);
router.get('/stats', protect, adminOnly, getTeacherStats);
router.get('/report', protect, adminOnly, getTeacherAttendanceReport);

module.exports = router;