const express = require('express');
const router = express.Router();
const { 
  registerTeacher, 
  loginTeacher, 
  getMe, 
  updateOwnProfile,      // 👈 Naya function
  updateTeacherByAdmin,  // 👈 Naya function
  getAllTeachers
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

// Protected Routes (Login zaroori hai)
router.get('/me', protect, getMe);
router.get('/all-teachers', protect, adminOnly, getAllTeachers);

// 🚀 Profile Update Routes
router.put('/update-profile', protect, updateOwnProfile); // Khud ka profile (Admin/Teacher)
router.put('/update-teacher/:teacherId', protect, adminOnly, updateTeacherByAdmin); // Kisi teacher ka profile (Sirf Admin)

module.exports = router;