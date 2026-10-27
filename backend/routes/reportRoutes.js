const express = require('express');
const router = express.Router();
const { getMonthlyReport, getTeacherMonthlyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Student Report
router.get('/monthly/:studentId', protect, getMonthlyReport);

// 🚀 NAYA: Teacher Report
router.get('/teacher-monthly/:teacherId', protect, getTeacherMonthlyReport);

module.exports = router;