const Teacher = require('../models/Teacher');
const TeacherAttendance = require('../models/TeacherAttendance');

// @desc    Teacher ki attendance lagao (Sirf Admin)
// @route   POST /api/teacher-attendance/scan
// @access  Private (Admin only)
const markTeacherAttendance = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const adminId = req.teacher._id;

    if (req.teacher.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Admin can mark teacher attendance' });
    }

    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR Code is required' });
    }

    const teacher = await Teacher.findOne({ username: qrCode });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Invalid Teacher QR Code' });
    }

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

    // 🚀 Late Logic (8:15 AM ke baad late)
    const localTime24 = today.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour12: false });
    const [localHour, localMinute] = localTime24.split(':').map(Number);

    let status = 'present';
    if (localHour > 8 || (localHour === 8 && localMinute > 15)) {
      status = 'late';
    }

    const existing = await TeacherAttendance.findOne({ teacherId: teacher._id, date: dateStr });
    if (existing) {
      return res.status(400).json({ success: false, message: `${teacher.name} already marked today at ${existing.timeIn}` });
    }

    await TeacherAttendance.create({
      teacherId: teacher._id,
      adminId,
      date: dateStr,
      timeIn: timeStr,
      status: status,
    });

    res.status(200).json({ success: true, teacherName: teacher.name, timeIn: timeStr, status: status });
  } catch (error) {
    console.error('Mark Teacher Attendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Teacher Stats for Dashboard
const getTeacherStats = async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

    const totalTeachers = await Teacher.countDocuments({ role: 'teacher', isActive: true });
    const presentTeachers = await TeacherAttendance.countDocuments({ date: dateStr });

    res.status(200).json({ 
      success: true, 
      totalTeachers, 
      presentTeachers,
      absentTeachers: totalTeachers - presentTeachers < 0 ? 0 : totalTeachers - presentTeachers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Teacher Attendance Report (Date-wise)
const getTeacherAttendanceReport = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const attendance = await TeacherAttendance.find({ date })
      .populate('teacherId', 'name username role')
      .sort({ timeIn: 1 });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 NAYA: Delete Teacher (Sirf Admin)
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    if (teacher.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });

    // Teacher ki saari attendance delete karein
    await TeacherAttendance.deleteMany({ teacherId: id });
    // Teacher ko delete karein
    await Teacher.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Teacher and records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚀 NAYA: Teacher ki puri history (Profile page ke liye)
const getTeacherHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const attendance = await TeacherAttendance.find({ teacherId: id }).sort({ date: -1 });

    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const totalLate = attendance.filter(a => a.status === 'late').length;
    const totalAbsent = attendance.filter(a => a.status === 'absent').length;
    const totalDays = totalPresent + totalLate + totalAbsent;
    const attendancePercentage = totalDays === 0 ? 0 : Math.round(((totalPresent + totalLate) / totalDays) * 100);

    res.status(200).json({ 
      success: true, 
      teacher: { name: teacher.name, username: teacher.username, role: teacher.role, schoolName: teacher.schoolName },
      stats: { totalPresent, totalLate, totalAbsent, attendancePercentage },
      attendance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  markTeacherAttendance, 
  getTeacherStats, 
  getTeacherAttendanceReport,
  deleteTeacher,
  getTeacherHistory
};