const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// @desc    Student ka QR scan karke attendance lagao (Late logic ke saath)
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
    
    // 🚀 NAYA: Time nikaalo
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // 🚀 NAYA: Late Logic (Agar 8:15 AM ke baad aaya to Late)
    let status = 'present';
    if (hours > 8 || (hours === 8 && minutes > 15)) {
      status = 'late';
    }

    const existingAttendance = await Attendance.findOne({ studentId: student._id, date: dateStr });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: `Already marked for ${student.name} at ${existingAttendance.timeIn}` });
    }

    await Attendance.create({ studentId: student._id, teacherId, date: dateStr, timeIn: timeStr, status: status });

    const message = `Assalam-o-Alaikum. Aapka beta ${student.name} (Roll No: ${student.rollNumber}) aaj Smart School ${status === 'late' ? 'der se ' : ''}aa gaya hai. Time: ${timeStr} hai.`;
    await sendWhatsAppMessage(student.fatherEmail || process.env.DEMO_EMAIL, message);

    res.status(200).json({ success: true, studentName: student.name, rollNumber: student.rollNumber, timeIn: timeStr, status: status });
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

// @desc    Class-wise Stats (Kis class me kitne present/absent hain)
const getClassWiseStats = async (req, res) => {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const schoolName = req.teacher.schoolName;

    const students = await Student.find({ schoolName, isActive: true });
    const todayAttendance = await Attendance.find({ date: dateStr, teacherId: req.teacher._id });

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

    const result = Object.values(classData).sort((a, b) => a.className.localeCompare(b.className));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
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