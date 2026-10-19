const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// @desc    Student ka QR scan karke attendance lagao (Class-wise logic ke saath)
const markAttendance = async (req, res) => {
  try {
    const { qrCode, targetClass } = req.body; 
    const teacherId = req.teacher._id;
    const schoolName = req.teacher.schoolName;

    if (!qrCode) return res.status(400).json({ success: false, message: 'QR Code is required' });

    const student = await Student.findOne({ qrCode, schoolName });
    if (!student) return res.status(404).json({ success: false, message: 'Invalid QR Code' });

    // Class-wise Check
    if (targetClass && student.className !== targetClass) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid Student! Ye student Class ${student.className} ka hai, aap Class ${targetClass} scan kar rahe hain.` 
      });
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
    const timeStr = today.toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const localTime = today.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour12: false });
    const [localHour, localMinute] = localTime.split(':').map(Number);

    let status = 'present';
    if (localHour > 8 || (localHour === 8 && localMinute > 15)) {
      status = 'late';
    }

    const existingAttendance = await Attendance.findOne({ studentId: student._id, date: dateStr });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: `Already marked for ${student.name} at ${existingAttendance.timeIn}` });
    }

    await Attendance.create({ studentId: student._id, teacherId, date: dateStr, timeIn: timeStr, status: status });

    const message = `Assalam-o-Alaikum. Aapka beta ${student.name} (Roll No: ${student.rollNumber}) aaj Smart School ${status === 'late' ? 'der se ' : ''}aa gaya hai. Time: ${timeStr} hai.`;
    
    await sendWhatsAppMessage(student.fatherEmail, student.fatherWhatsApp, message);

    res.status(200).json({ success: true, studentName: student.name, rollNumber: student.rollNumber, timeIn: timeStr, status: status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Aaj ki total attendance count
const getTodayAttendanceCount = async (req, res) => {
  try {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); 
    const count = await Attendance.countDocuments({ teacherId: req.teacher._id, date: dateStr });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Dashboard ke liye aaj ka data
const getDashboardStats = async (req, res) => {
  try {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); 
    const totalStudents = await Student.countDocuments({ schoolName: req.teacher.schoolName, isActive: true });
    const presentToday = await Attendance.countDocuments({ teacherId: req.teacher._id, date: dateStr });
    const absentToday = totalStudents - presentToday;

    res.status(200).json({ success: true, totalStudents, presentToday, absentToday: absentToday < 0 ? 0 : absentToday });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Class-wise Stats
const getClassWiseStats = async (req, res) => {
  try {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
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
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
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

// 🚀 NAYA FEATURE: Low Attendance Alert (Class filter ke saath)
const getLowAttendanceStudents = async (req, res) => {
  try {
    const { className } = req.query; // 👈 URL se class receive kar rahe hain
    const schoolName = req.teacher.schoolName;
    
    // Agar class select ki hai to sirf usi class ke students lo
    let query = { schoolName, isActive: true };
    if (className && className !== 'all') {
      query.className = className;
    }

    const students = await Student.find(query);
    
    const lowAttendanceList = [];
    const totalDays = 20; // Demo ke liye 20 din ka standard

    for (const student of students) {
      const totalPresent = await Attendance.countDocuments({ 
        studentId: student._id, 
        status: { $in: ['present', 'late'] } 
      });
      
      const percentage = Math.round((totalPresent / totalDays) * 100);
      
      if (percentage < 75) {
        lowAttendanceList.push({
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          className: student.className,
          percentage: percentage > 100 ? 100 : percentage
        });
      }
    }

    lowAttendanceList.sort((a, b) => a.percentage - b.percentage);
    res.status(200).json({ success: true, data: lowAttendanceList });
  } catch (error) {
    console.error('Low Attendance Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { markAttendance, getTodayAttendanceCount, getDashboardStats, getClassWiseStats, markAbsentees, getLowAttendanceStudents };