const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// @desc    Student ka QR scan karke attendance lagao
const markAttendance = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const teacherId = req.teacher._id;
    const schoolName = req.teacher.schoolName;

    if (!qrCode) return res.status(400).json({ success: false, message: 'QR Code is required' });

    const student = await Student.findOne({ qrCode, schoolName });
    if (!student) return res.status(404).json({ success: false, message: 'Invalid QR Code' });

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; 
    const timeStr = today.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }); 

    const existingAttendance = await Attendance.findOne({ studentId: student._id, date: dateStr });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: `Already marked for ${student.name} at ${existingAttendance.timeIn}` });
    }

    await Attendance.create({ studentId: student._id, teacherId, date: dateStr, timeIn: timeStr, status: 'present' });

    const message = `Assalam-o-Alaikum. Aapka beta ${student.name} (Roll No: ${student.rollNumber}) aaj Smart School aa gaya hai. Time: ${timeStr} hai.`;
    await sendWhatsAppMessage(student.fatherEmail || process.env.DEMO_EMAIL, message);

    res.status(200).json({ success: true, studentName: student.name, rollNumber: student.rollNumber, timeIn: timeStr });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Aaj ki total attendance count
const getTodayAttendanceCount = async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0]; 
    const count = await Attendance.countDocuments({ teacherId: req.teacher._id, date: dateStr });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Dashboard ke liye aaj ka data
const getDashboardStats = async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0]; 
    const totalStudents = await Student.countDocuments({ schoolName: req.teacher.schoolName, isActive: true });
    const presentToday = await Attendance.countDocuments({ teacherId: req.teacher._id, date: dateStr });
    const absentToday = totalStudents - presentToday;

    res.status(200).json({ success: true, totalStudents, presentToday, absentToday: absentToday < 0 ? 0 : absentToday });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🚀 NAYA FEATURE: Class-wise Stats (Kis class me kitne present/absent hain)
// @route   GET /api/attendance/class-stats
const getClassWiseStats = async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const schoolName = req.teacher.schoolName;

    // Saare students nikaalo
    const students = await Student.find({ schoolName, isActive: true });
    
    // Aaj ki attendance nikaalo
    const todayAttendance = await Attendance.find({ date: dateStr, teacherId: req.teacher._id });

    // Class ke hisaab se data group karo
    const classData = {};

    students.forEach(student => {
      const className = student.className;
      if (!classData[className]) {
        classData[className] = { className, total: 0, present: 0, absent: 0 };
      }
      classData[className].total += 1;
      
      const isPresent = todayAttendance.find(a => a.studentId.toString() === student._id.toString());
      if (isPresent) classData[className].present += 1;
      else classData[className].absent += 1;
    });

    // Object ko Array me badlo aur sort karo
    const result = Object.values(classData).sort((a, b) => a.className.localeCompare(b.className));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark all unscanned students as absent
const markAbsentees = async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const presentRecords = await Attendance.find({ date: dateStr, teacherId: req.teacher._id }).select('studentId');
    const presentStudentIds = presentRecords.map(r => r.studentId.toString());

    const absentStudents = await Student.find({ schoolName: req.teacher.schoolName, isActive: true, _id: { $nin: presentStudentIds } });

    const absentRecords = absentStudents.map(student => ({
      studentId: student._id, teacherId: req.teacher._id, date: dateStr, timeIn: '00:00:00', status: 'absent'
    }));

    if (absentRecords.length > 0) await Attendance.insertMany(absentRecords);
    res.status(200).json({ success: true, message: `${absentStudents.length} students marked as absent.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { markAttendance, getTodayAttendanceCount, getDashboardStats, getClassWiseStats, markAbsentees };