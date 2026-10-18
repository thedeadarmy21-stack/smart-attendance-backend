const express = require('express');
const router = express.Router();
const {
  registerTeacher,
  loginTeacher,
  getMe,
  changePassword,
  resetDeviceLocks
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword); // 👈 Naya route
router.get('/reset-locks', resetDeviceLocks);

module.exports = router;