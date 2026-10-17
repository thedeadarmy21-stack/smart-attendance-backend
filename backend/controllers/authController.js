const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

// JWT token generate karo
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // 30 din tak valid
  });
};

// @desc    Teacher register
// @route   POST /api/auth/register
// @access  Public (baad me admin-only karenge)
const registerTeacher = async (req, res) => {
  try {
    const { name, username, password, schoolName } = req.body;

    // Validation
    if (!name || !username || !password || !schoolName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, username, password, and schoolName',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check karo username already exists
    const existingTeacher = await Teacher.findOne({ username: username.toLowerCase() });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Teacher banao
    const teacher = await Teacher.create({
      name,
      username,
      password,
      schoolName,
    });

    // Token generate karo
    const token = generateToken(teacher._id);

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        username: teacher.username,
        schoolName: teacher.schoolName,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Teacher login (With Device Lock Security)
// @route   POST /api/auth/login
// @access  Public
const loginTeacher = async (req, res) => {
  try {
    // Frontend se deviceId bhi aayegi
    const { username, password, deviceId } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Teacher dhundo (password ke saath)
    const teacher = await Teacher.findOne({
      username: username.toLowerCase(),
    }).select('+password');

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Password match karo
    const isMatch = await teacher.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // 👇 DEVICE LOCK SECURITY LOGIC 👇
    if (!teacher.allowedDeviceId) {
      // Agar pehli baar login ho raha hai, to is phone ko allow kar do
      teacher.allowedDeviceId = deviceId;
      await teacher.save();
    } else if (teacher.allowedDeviceId !== deviceId) {
      // Agar koi dusre phone se login karne ki koshish kare, to block kar do
      return res.status(403).json({
        success: false,
        message: 'Security Alert: This App is locked to another phone. Cannot use here.',
      });
    }
    // 👆 DEVICE LOCK SECURITY LOGIC 👆

    // Token generate karo
    const token = generateToken(teacher._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        username: teacher.username,
        schoolName: teacher.schoolName,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get current logged-in teacher
// @route   GET /api/auth/me
// @access  Private (token required)
const getMe = async (req, res) => {
  try {
    // req.teacher authMiddleware ne set kiya hai
    res.status(200).json({
      success: true,
      teacher: req.teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// 🛠️ TEMPORARY CODE: Device Lock Reset karne ke liye
const resetDeviceLocks = async (req, res) => {
  try {
    await Teacher.updateMany({}, { allowedDeviceId: null });
    res.json({ success: true, message: 'All devices unlocked! You can now login from any new phone.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👇 Yahan resetDeviceLocks ko export me add kiya gaya hai 👇
module.exports = { registerTeacher, loginTeacher, getMe, resetDeviceLocks };