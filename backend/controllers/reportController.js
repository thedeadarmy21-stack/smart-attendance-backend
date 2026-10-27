const Attendance = require('../models/Attendance');
const TeacherAttendance = require('../models/TeacherAttendance');

// @desc    Student ki monthly attendance report
// @route   GET /api/reports/monthly/:studentId?month=YYYY-MM
const getMonthlyReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
    }

    const attendance = await Attendance.find({
      studentId,
      date: { $regex: `^${month}` },
    }).sort({ date: 1 });

    const totalDaysPresent = attendance.filter(a => a.status === 'present').length;
    const totalDaysLate = attendance.filter(a => a.status === 'late').length;
    const totalDaysAbsent = attendance.filter(a => a.status === 'absent').length;
    const totalDaysAttended = totalDaysPresent + totalDaysLate;

    res.status(200).json({
      success: true,
      totalDaysPresent,
      totalDaysLate,
      totalDaysAbsent,
      totalDaysAttended,
      totalRecords: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🚀 NAYA: Teacher ki monthly attendance report
// @route   GET /api/reports/teacher-monthly/:teacherId?month=YYYY-MM
const getTeacherMonthlyReport = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
    }

    const attendance = await TeacherAttendance.find({
      teacherId,
      date: { $regex: `^${month}` },
    }).sort({ date: 1 });

    const totalDaysPresent = attendance.filter(a => a.status === 'present').length;
    const totalDaysLate = attendance.filter(a => a.status === 'late').length;
    const totalDaysAbsent = attendance.filter(a => a.status === 'absent').length;
    const totalDaysAttended = totalDaysPresent + totalDaysLate;

    res.status(200).json({
      success: true,
      totalDaysPresent,
      totalDaysLate,
      totalDaysAbsent,
      totalDaysAttended,
      totalRecords: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error('Teacher Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMonthlyReport, getTeacherMonthlyReport };