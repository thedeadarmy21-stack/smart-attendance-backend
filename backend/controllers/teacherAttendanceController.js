const Teacher = require('../models/Teacher');
const TeacherAttendance = require('../models/TeacherAttendance');

// @desc    Teacher ki attendance lagao (Sirf Admin)
// @route   POST /api/teacher-attendance/scan
// @access  Private (Admin only)
const markTeacherAttendance = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const adminId = req.teacher._id;

    // Check karo ke logged-in user admin hai ya nahi
    if (req.teacher.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only Admin can mark teacher attendance' 
      });
    }

    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR Code is required' });
    }

    // QR Code me teacher ka username hoga
    const teacher = await Teacher.findOne({ username: qrCode });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Invalid Teacher QR Code' });
    }

    // Agar khud admin ka QR scan ho jaye to rok do
    if (teacher._id.toString() === adminId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot mark your own attendance' });
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
    const timeStr = today.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Karachi',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });

    // Check karo ke aaj pehle se attendance lagi hai ya nahi
    const existing = await TeacherAttendance.findOne({ 
      teacherId: teacher._id, 
      date: dateStr 
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `${teacher.name} already marked today at ${existing.timeIn}` 
      });
    }

    await TeacherAttendance.create({
      teacherId: teacher._id,
      adminId,
      date: dateStr,
      timeIn: timeStr,
      status: 'present',
    });

    res.status(200).json({ 
      success: true, 
      teacherName: teacher.name, 
      timeIn: timeStr 
    });
  } catch (error) {
    console.error('Mark Teacher Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Aaj ki total teachers ki attendance count (Dashboard ke liye)
// @route   GET /api/teacher-attendance/stats
// @access  Private (Admin only)
const getTeacherStats = async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

    // Total teachers count (sirf teacher role wale, admin nahi)
    const totalTeachers = await Teacher.countDocuments({ 
      role: 'teacher', 
      isActive: true 
    });

    // Aaj kitne teachers present hain
    const presentTeachers = await TeacherAttendance.countDocuments({ 
      date: dateStr 
    });

    res.status(200).json({ 
      success: true, 
      totalTeachers, 
      presentTeachers,
      absentTeachers: totalTeachers - presentTeachers < 0 ? 0 : totalTeachers - presentTeachers
    });
  } catch (error) {
    console.error('Teacher Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Saari teachers ki attendance report (date ke hisaab se)
// @route   GET /api/teacher-attendance/report?date=YYYY-MM-DD
// @access  Private (Admin only)
const getTeacherAttendanceReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const attendance = await TeacherAttendance.find({ date })
      .populate('teacherId', 'name username role')
      .sort({ timeIn: 1 });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error('Teacher Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  markTeacherAttendance, 
  getTeacherStats, 
  getTeacherAttendanceReport 
};