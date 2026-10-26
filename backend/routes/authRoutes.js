const express = require('express');
const router = express.Router();
const { 
  registerTeacher, 
  loginTeacher, 
  getMe, 
  updateProfile,
  getAllTeachers // 👈 Naya Import
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile); 

// 🚀 NAYA ROUTE: Saare teachers ki list
router.get('/all-teachers', protect, getAllTeachers);

module.exports = router;