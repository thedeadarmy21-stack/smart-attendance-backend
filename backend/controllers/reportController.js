const Attendance = require('../models/Attendance');

// @desc    Kisi student ki monthly attendance report
// @route   GET /api/reports/monthly/:studentId?month=2026-10
// @access  Private
const getMonthlyReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query; // Format: "YYYY-MM"

    if (!month) {
      return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
    }

    // Month ke hisaab se attendance nikalo
    const attendance = await Attendance.find({
      studentId,
      date: { $regex: `^${month}` }, // "2026-10" se start hone wali dates
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      totalDaysPresent: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMonthlyReport };