const express = require('express');
const router = express.Router();
const { markAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/attendance/scan
router.post('/scan', protect, markAttendance);

module.exports = router;