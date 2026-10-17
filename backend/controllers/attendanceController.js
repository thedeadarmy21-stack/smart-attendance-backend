const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
// 👇 Baileys nahi, ab hum email wali file import kar rahe hain
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

    // 1. Student dhundo
    const student = await Student.findOne({ qrCode, schoolName });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Invalid QR Code. Student not found.' });
    }

    // 2. Aaj ki date aur time nikalo (24-Hour Format)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = today.toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }); // HH:MM:SS

    // 3. Check karo ke aaj pehle se attendance laga hai ya nahi
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

    // 4. Attendance save karo
    await Attendance.create({
      studentId: student._id,
      teacherId,
      date: dateStr,
      timeIn: timeStr,
      status: 'present',
    });

    // 5. Father ko Email bhejo
    const message = `Assalam-o-Alaikum. Aapka beta ${student.name} (Roll No: ${student.rollNumber}) aaj Smart School aa gaya hai. Time: ${timeStr} hai.`;
    
    // 👇 Yahan student ki fatherEmail bhej rahe hain
    // Agar database me email nahi hai (purane students), to fallback ke liye DEMO_EMAIL use hoga
    const targetEmail = student.fatherEmail || process.env.DEMO_EMAIL;
    await sendWhatsAppMessage(targetEmail, message);

    // 6. Frontend ko success response bhejo
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

module.exports = { markAttendance, getTodayAttendanceCount };