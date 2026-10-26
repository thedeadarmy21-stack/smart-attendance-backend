const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

// Protected route ke liye — sirf logged-in teacher access kar sake
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.teacher = await Teacher.findById(decoded.id).select('-password');

      if (!req.teacher) {
        return res.status(401).json({
          success: false,
          message: 'Teacher not found. Please login again.',
        });
      }

      if (!req.teacher.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Contact admin.',
        });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token invalid or expired.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }
};

// ✅ NAYA: Sirf Admin access kar sake
// Use: router.post('/scan', protect, adminOnly, controller)
const adminOnly = (req, res, next) => {
  if (!req.teacher) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  if (req.teacher.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }

  next();
};

module.exports = { protect, adminOnly };