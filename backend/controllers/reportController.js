const Attendance = require('../models/Attendance');

// @desc    Kisi student ki monthly attendance report
// @route   GET /api/reports/monthly/:studentId?month=2026-10
// @access  Private
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

    // ✅ Teeno count alag-alag nikaalo
    const totalDaysPresent = attendance.filter(a => a.status === 'present').length;
    const totalDaysLate = attendance.filter(a => a.status === 'late').length;
    const totalDaysAbsent = attendance.filter(a => a.status === 'absent').length;

    // ✅ Total present = present + late (late bhi present count hota hai)
    const totalDaysAttended = totalDaysPresent + totalDaysLate;

    res.status(200).json({
      success: true,
      totalDaysPresent,      // sirf 'present'
      totalDaysLate,         // ✅ naya
      totalDaysAbsent,       // ✅ naya
      totalDaysAttended,     // ✅ present + late
      totalRecords: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMonthlyReport };