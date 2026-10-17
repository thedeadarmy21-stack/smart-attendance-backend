const express = require('express');
const router = express.Router();
const { addStudent, getStudents } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/students/add  (Token required)
router.post('/add', protect, addStudent);

// GET /api/students  (Token required)
router.get('/', protect, getStudents);

module.exports = router;