const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// @desc    Student ka QR scan karke attendance lagao
// @route   POST /api/attendance/scan
// @access  Private (Teacher)
const markAttendance = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const teacherId = req.teacher._id;
    const schoolName = req.teacher.schoolName;

    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR Code is required' });
    }

    const student = await Student.findOne({ qrCode, schoolName });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Invalid QR Code. Student not found.' });
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; 
    const timeStr = today.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }); 

    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      date: dateStr,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: `Attendance already marked for ${student.name} today at ${existingAttendance.timeIn}`,
      });
    }

    await Attendance.create({
      studentId: student._id,
      teacherId,
      date: dateStr,
      timeIn: timeStr,
      status: 'present',
    });

    const message = `Assalam-o-Alaikum. Aapka beta ${student.name} (Roll No: ${student.rollNumber}) aaj Smart School aa gaya hai. Time: ${timeStr} hai.`;
    const targetEmail = student.fatherEmail || process.env.DEMO_EMAIL;
    await sendWhatsAppMessage(targetEmail, message);

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      studentName: student.name,
      rollNumber: student.rollNumber,
      date: dateStr,
      timeIn: timeStr,
    });

  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({ success: false, message: 'Server error during scanning' });
  }
};

// @desc    Aaj ki total attendance count laao
// @route   GET /api/attendance/today
// @access  Private (Teacher)
const getTodayAttendanceCount = async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; 
    
    const count = await Attendance.countDocuments({
      teacherId: req.teacher._id, 
      date: dateStr
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Count Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Dashboard ke liye aaj ka data
// @route   GET /api/attendance/dashboard-stats
// @access  Private (Teacher)
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; 

    const totalStudents = await Student.countDocuments({
      schoolName: req.teacher.schoolName,
      isActive: true
    });

    const presentToday = await Attendance.countDocuments({
      teacherId: req.teacher._id, 
      date: dateStr
    });

    const absentToday = totalStudents - presentToday;

    res.status(200).json({ 
      success: true, 
      totalStudents, 
      presentToday, 
      absentToday: absentToday < 0 ? 0 : absentToday 
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🚀 NAYA FEATURE: Jin bacho ne scan nahi karwaya unhe absent mark karo
// @desc    Mark all unscanned students as absent
// @route   POST /api/attendance/mark-absent
// @access  Private (Teacher)
const markAbsentees = async (req, res) => {
  try {
    const teacherId = req.teacher._id;
    const schoolName = req.teacher.schoolName;
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = '00:00:00';

    // 1. Aaj jinke present hain unki IDs nikaalo
    const presentRecords = await Attendance.find({ date: dateStr, teacherId }).select('studentId');
    const presentStudentIds = presentRecords.map(r => r.studentId.toString());

    // 2. Un sab bacho ko dhundo jo aaj present nahi hain
    const absentStudents = await Student.find({
      schoolName,
      isActive: true,
      _id: { $nin: presentStudentIds }
    });

    // 3. Unko absent mark karo
    const absentRecords = absentStudents.map(student => ({
      studentId: student._id,
      teacherId,
      date: dateStr,
      timeIn: timeStr,
      status: 'absent'
    }));

    if (absentRecords.length > 0) {
      await Attendance.insertMany(absentRecords);
    }

    res.status(200).json({ 
      success: true, 
      message: `${absentStudents.length} students marked as absent successfully.` 
    });

  } catch (error) {
    console.error('Mark Absent Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { markAttendance, getTodayAttendanceCount, getDashboardStats, markAbsentees };