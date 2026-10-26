const express = require('express');
const router = express.Router();
const { 
  registerTeacher, 
  loginTeacher, 
  getMe, 
  updateOwnProfile,
  updateTeacherByAdmin,
  getAllTeachers
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

// Protected Routes
router.get('/me', protect, getMe);
router.get('/all-teachers', protect, adminOnly, getAllTeachers);

// Profile Update Routes
router.put('/update-profile', protect, updateOwnProfile);
router.put('/update-teacher/:teacherId', protect, adminOnly, updateTeacherByAdmin);

module.exports = router;