const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

// JWT token generate karo
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Teacher register
const registerTeacher = async (req, res) => {
  try {
    const { name, username, password, schoolName } = req.body;
    if (!name || !username || !password || !schoolName) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be 6 characters' });
    }
    const existingTeacher = await Teacher.findOne({ username: username.toLowerCase() });
    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    const teacher = await Teacher.create({ name, username, password, schoolName });
    const token = generateToken(teacher._id);
    res.status(201).json({
      success: true, message: 'Teacher registered', token,
      teacher: { id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Teacher login
const loginTeacher = async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Provide username and password' });
    }
    const teacher = await Teacher.findOne({ username: username.toLowerCase() }).select('+password');
    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await teacher.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Device Lock Logic
    if (!teacher.allowedDeviceId) {
      teacher.allowedDeviceId = deviceId;
      await teacher.save();
    } else if (teacher.allowedDeviceId !== deviceId) {
      return res.status(403).json({ success: false, message: 'Security Alert: App locked to another phone.' });
    }

    const token = generateToken(teacher._id);
    res.status(200).json({
      success: true, message: 'Login successful', token,
      teacher: { id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged-in teacher
const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, teacher: req.teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🚀 NAYA FEATURE: Change Password
// @desc    Change logged-in teacher's password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const teacherId = req.teacher._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const teacher = await Teacher.findById(teacherId).select('+password');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const isMatch = await teacher.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    teacher.password = newPassword;
    await teacher.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Device lock reset (temporary)
const resetDeviceLocks = async (req, res) => {
  try {
    await Teacher.updateMany({}, { allowedDeviceId: null });
    res.json({ success: true, message: 'All devices unlocked!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTeacher, loginTeacher, getMe, changePassword, resetDeviceLocks };