const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // 👈 Bypass ke liye zaroori hai
const Teacher = require('../models/Teacher');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register (Naye teacher ya admin ke liye)
const registerTeacher = async (req, res) => {
  try {
    const { name, username, password, schoolName, role } = req.body;
    if (!name || !username || !password || !schoolName) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    const existingTeacher = await Teacher.findOne({ username: username.toLowerCase() });
    if (existingTeacher) return res.status(400).json({ success: false, message: 'Username already taken' });

    const teacher = await Teacher.create({ 
      name, 
      username, 
      password, 
      schoolName, 
      role: role || 'teacher'
    });
    
    const token = generateToken(teacher._id, teacher.role);
    res.status(201).json({ 
      success: true, 
      message: 'Registered', 
      token, 
      teacher: { id: teacher._id, name, username, schoolName, role: teacher.role } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
const loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Provide credentials' });

    const teacher = await Teacher.findOne({ username: username.toLowerCase() }).select('+password');
    if (!teacher) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // 👇 YAHAN HAI MAGIC (Bypass Logic)
    let isMatch = false;

    // 1. Normal Check (Encrypted password ke liye)
    isMatch = await teacher.matchPassword(password);

    // 2. Bypass Check (Agar MongoDB me password plain text me hai)
    if (!isMatch && teacher.password === password) {
      isMatch = true;
      
      // Ab usko auto-encrypt kar ke save kar do taake aage ke liye sahi ho jaye
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password, salt);
      await teacher.save();
      console.log(`✅ Password automatically encrypted for: ${teacher.username}`);
    }

    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(teacher._id, teacher.role);
    
    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      teacher: { 
        id: teacher._id, 
        name: teacher.name, 
        username: teacher.username, 
        schoolName: teacher.schoolName,
        role: teacher.role
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, teacher: req.teacher });
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { newUsername, currentPassword, newPassword } = req.body;
    const teacher = await Teacher.findById(req.teacher._id).select('+password');

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    if (currentPassword) {
      const isMatch = await teacher.matchPassword(currentPassword);
      // Bypass check for update profile too
      if (!isMatch && teacher.password !== currentPassword) {
        return res.status(401).json({ success: false, message: 'Incorrect current password' });
      }
    } else if (newPassword || newUsername) {
      return res.status(400).json({ success: false, message: 'Current password is required to make changes' });
    }

    if (newUsername && newUsername !== teacher.username) {
      const existing = await Teacher.findOne({ username: newUsername.toLowerCase() });
      if (existing) return res.status(400).json({ success: false, message: 'Username already taken' });
      teacher.username = newUsername.toLowerCase();
    }

    if (newPassword) {
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be 6 characters' });
      teacher.password = newPassword;
    }

    await teacher.save();
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      teacher: { 
        id: teacher._id, 
        name: teacher.name, 
        username: teacher.username, 
        schoolName: teacher.schoolName,
        role: teacher.role
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 NAYA: Saare teachers ki list (Admin Panel ke liye)
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .select('name username role schoolName createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: teachers.length,
      teachers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTeacher, loginTeacher, getMe, updateProfile, getAllTeachers };