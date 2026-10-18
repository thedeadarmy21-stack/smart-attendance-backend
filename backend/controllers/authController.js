const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
const registerTeacher = async (req, res) => {
  try {
    const { name, username, password, schoolName } = req.body;
    if (!name || !username || !password || !schoolName) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const existingTeacher = await Teacher.findOne({ username: username.toLowerCase() });
    if (existingTeacher) return res.status(400).json({ success: false, message: 'Username already taken' });

    const teacher = await Teacher.create({ name, username, password, schoolName });
    const token = generateToken(teacher._id);
    res.status(201).json({ success: true, message: 'Registered', token, teacher: { id: teacher._id, name, username, schoolName } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
const loginTeacher = async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Provide credentials' });

    const teacher = await Teacher.findOne({ username: username.toLowerCase() }).select('+password');
    if (!teacher) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await teacher.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!teacher.allowedDeviceId) {
      teacher.allowedDeviceId = deviceId;
      await teacher.save();
    } else if (teacher.allowedDeviceId !== deviceId) {
      return res.status(403).json({ success: false, message: 'Security Alert: App locked to another phone.' });
    }

    const token = generateToken(teacher._id);
    res.status(200).json({ success: true, message: 'Login successful', token, teacher: { id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, teacher: req.teacher });
};

// 🚀 NAYA FEATURE: Update Profile (Username & Password)
const updateProfile = async (req, res) => {
  try {
    const { newUsername, currentPassword, newPassword } = req.body;
    const teacher = await Teacher.findById(req.teacher._id).select('+password');

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    // 1. Password verify karo (security ke liye)
    if (currentPassword) {
      const isMatch = await teacher.matchPassword(currentPassword);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect current password' });
    } else if (newPassword || newUsername) {
      return res.status(400).json({ success: false, message: 'Current password is required to make changes' });
    }

    // 2. Username update karo (agar diya hai)
    if (newUsername && newUsername !== teacher.username) {
      const existing = await Teacher.findOne({ username: newUsername.toLowerCase() });
      if (existing) return res.status(400).json({ success: false, message: 'Username already taken' });
      teacher.username = newUsername.toLowerCase();
    }

    // 3. Password update karo (agar diya hai)
    if (newPassword) {
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be 6 characters' });
      teacher.password = newPassword;
    }

    await teacher.save();
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      teacher: { id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetDeviceLocks = async (req, res) => {
  await Teacher.updateMany({}, { allowedDeviceId: null });
  res.json({ success: true, message: 'All devices unlocked!' });
};

module.exports = { registerTeacher, loginTeacher, getMe, updateProfile, resetDeviceLocks };