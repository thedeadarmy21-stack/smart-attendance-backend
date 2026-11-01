const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { generateQRId, generateQRImage } = require('../utils/qrGenerator');

// @desc    Naya student add karo
const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, className, section, fatherName, fatherWhatsApp, fatherEmail, profilePicture } = req.body;

    // 🚀 FIX: fatherEmail ab zaroori nahi hai
    if (!name || !rollNumber || !className || !fatherName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingStudent = await Student.findOne({ rollNumber, className, section: section || 'A', schoolName: req.teacher.schoolName });
    if (existingStudent) return res.status(400).json({ success: false, message: 'This student already exists in this class' });

    const qrId = generateQRId(rollNumber, className, section || 'A');

    const student = await Student.create({
      name, rollNumber, className, section: section || 'A', fatherName,
      fatherWhatsApp: fatherWhatsApp || '', 
      fatherEmail: fatherEmail || '', // 🚀 Empty string agar nahi hai
      qrCode: qrId, schoolName: req.teacher.schoolName,
      profilePicture: profilePicture || '',
    });

    const qrImageDataUrl = await generateQRImage(qrId);

    res.status(201).json({
      success: true, message: 'Student added successfully',
      student: { id: student._id, name: student.name, rollNumber: student.rollNumber, className: student.className, section: student.section, fatherName: student.fatherName, fatherEmail: student.fatherEmail, qrCode: student.qrCode, qrImage: qrImageDataUrl, profilePicture: student.profilePicture },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while adding student', error: error.message });
  }
};

// @desc    Saare students dekho
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ schoolName: req.teacher.schoolName }).sort({ className: 1, rollNumber: 1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Ek student ki puri profile aur attendance history
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, schoolName: req.teacher.schoolName });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const attendance = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const totalLate = attendance.filter(a => a.status === 'late').length;
    const totalAbsent = attendance.filter(a => a.status === 'absent').length;

    res.status(200).json({ success: true, student, attendance, stats: { totalPresent, totalLate, totalAbsent } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🚀 NAYA: Student ka data update karo
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNumber, className, section, fatherName, fatherWhatsApp, fatherEmail, profilePicture } = req.body;

    const student = await Student.findOne({ _id: id, schoolName: req.teacher.schoolName });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (rollNumber && rollNumber !== student.rollNumber) {
      const existing = await Student.findOne({ 
        rollNumber, 
        className: className || student.className, 
        section: section || student.section, 
        schoolName: req.teacher.schoolName,
        _id: { $ne: id }
      });
      if (existing) return res.status(400).json({ success: false, message: 'This roll number already exists in this class' });
    }

    if (name) student.name = name;
    if (rollNumber) student.rollNumber = rollNumber;
    if (className) student.className = className;
    if (section) student.section = section;
    if (fatherName) student.fatherName = fatherName;
    if (fatherWhatsApp !== undefined) student.fatherWhatsApp = fatherWhatsApp;
    if (fatherEmail !== undefined) student.fatherEmail = fatherEmail; // 🚀 Undefined check
    if (profilePicture !== undefined) student.profilePicture = profilePicture;

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: { 
        id: student._id, name: student.name, rollNumber: student.rollNumber, 
        className: student.className, section: student.section, fatherName: student.fatherName, 
        fatherWhatsApp: student.fatherWhatsApp, fatherEmail: student.fatherEmail, profilePicture: student.profilePicture 
      },
    });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating student' });
  }
};

// 🚀 Student Delete karo
const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const student = await Student.findOne({ _id: studentId, schoolName: req.teacher.schoolName });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await Attendance.deleteMany({ studentId: studentId });
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({ success: true, message: 'Student and their records deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting student' });
  }
};

module.exports = { addStudent, getStudents, getStudentProfile, updateStudent, deleteStudent };