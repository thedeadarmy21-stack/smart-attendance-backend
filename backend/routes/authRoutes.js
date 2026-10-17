const express = require('express');
const router = express.Router();
const {
  registerTeacher,
  loginTeacher,
  getMe,
  resetDeviceLocks // 👈 Ye import karna zaroori tha
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);
router.get('/me', protect, getMe);
router.get('/reset-locks', resetDeviceLocks); // 👈 Ye route add kiya

module.exports = router;