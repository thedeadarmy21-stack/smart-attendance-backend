const express = require('express');
const router = express.Router();
const { addStudent, getStudents, getStudentProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addStudent);
router.get('/', protect, getStudents);
router.get('/profile/:id', protect, getStudentProfile); // 👈 Naya Route

module.exports = router;