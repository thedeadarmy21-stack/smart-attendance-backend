const Student = require('../models/Student');
const Attendance = require('../models/Attendance'); // 👈 Naya import
const { generateQRId, generateQRImage } = require('../utils/qrGenerator');

// @desc    Naya student add karo
const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, className, section, fatherName, fatherWhatsApp, fatherEmail } = req.body;

    if (!name || !rollNumber || !className || !fatherName || !fatherEmail) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingStudent = await Student.findOne({
      rollNumber, className, section: section || 'A', schoolName: req.teacher.schoolName,
    });

    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'This student already exists in this class' });
    }

    const qrId = generateQRId(rollNumber, className, section || 'A');

    const student = await Student.create({
      name, rollNumber, className, section: section || 'A', fatherName,
      fatherWhatsApp: fatherWhatsApp || '', fatherEmail, qrCode: qrId, schoolName: req.teacher.schoolName,
    });

    const qrImageDataUrl = await generateQRImage(qrId);

    res.status(201).json({
      success: true, message: 'Student added successfully',
      student: { id: student._id, name: student.name, rollNumber: student.rollNumber, className: student.className, section: student.section, fatherName: student.fatherName, fatherEmail: student.fatherEmail, qrCode: student.qrCode, qrImage: qrImageDataUrl },
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

// 🚀 NAYA FEATURE: Ek student ki puri profile aur attendance history
// @route   GET /api/students/profile/:id
const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findOne({ _id: studentId, schoolName: req.teacher.schoolName });
    
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Us student ki saari attendance nikaalo (latest pehle)
    const attendance = await Attendance.find({ studentId }).sort({ date: -1 });

    // Total present aur late count karo
    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const totalLate = attendance.filter(a => a.status === 'late').length;
    const totalAbsent = attendance.filter(a => a.status === 'absent').length;

    res.status(200).json({
      success: true,
      student,
      attendance,
      stats: { totalPresent, totalLate, totalAbsent }
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addStudent, getStudents, getStudentProfile };