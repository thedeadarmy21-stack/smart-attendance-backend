const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 🚀 REGISTER (Naya account banane ke liye)
const registerTeacher = async (req, res) => {
  try {
    const { name, username, password, schoolName, role } = req.body;
    
    const existingTeacher = await Teacher.findOne({ username: username.toLowerCase() });
    if (existingTeacher) return res.status(400).json({ success: false, message: 'Username already taken' });

    const teacher = await Teacher.create({ name, username, password, schoolName, role });
    const token = generateToken(teacher._id, teacher.role);
    
    res.status(201).json({ success: true, token, teacher: {
      id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName, role: teacher.role
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 LOGIN (Verify logic)
const loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;

    const teacher = await Teacher.findOne({ username: username.toLowerCase() }).select('+password');
    if (!teacher) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await teacher.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(teacher._id, teacher.role);
    
    res.status(200).json({ success: true, token, teacher: {
      id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName, role: teacher.role
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 NAYA: APNA PROFILE UPDATE KARNA (Admin khud ke liye use karega)
const updateOwnProfile = async (req, res) => {
  try {
    const { newUsername, currentPassword, newPassword } = req.body;
    const teacher = await Teacher.findById(req.teacher._id).select('+password');

    if (!teacher) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Verify current password
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required to make changes' });
    }
    const isMatch = await teacher.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect current password' });

    // 2. Update Username (if provided)
    if (newUsername && newUsername !== teacher.username) {
      const existing = await Teacher.findOne({ username: newUsername.toLowerCase() });
      if (existing) return res.status(400).json({ success: false, message: 'Username already taken' });
      teacher.username = newUsername.toLowerCase();
    }

    // 3. Update Password (if provided) - Model khud hash kar dega
    if (newPassword) {
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be 6 characters' });
      teacher.password = newPassword; 
    }

    await teacher.save(); // pre('save') trigger hoga aur password hash hoga

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      teacher: { id: teacher._id, name: teacher.name, username: teacher.username, schoolName: teacher.schoolName, role: teacher.role } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 NAYA: KISI TEACHER KA PROFILE UPDATE KARNA (Sirf Admin use karega)
const updateTeacherByAdmin = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { newUsername, newPassword } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    if (teacher.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot update another admin' });
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
      message: 'Teacher profile updated successfully', 
      teacher: { id: teacher._id, name: teacher.name, username: teacher.username, role: teacher.role } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 NAYA: Saare teachers ki list
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .select('name username role schoolName createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  registerTeacher, 
  loginTeacher, 
  updateOwnProfile, 
  updateTeacherByAdmin, 
  getAllTeachers 
};