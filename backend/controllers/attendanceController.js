const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// @desc    Student ka QR scan karke attendance lagao
const markAttendance = async (req, res) => {
  try {
    const { qrCode, targetClass } = req.body; 
    const teacherId = req.teacher._id;
    const teacherName = req.teacher.name;
    const schoolName = req.teacher.schoolName;

    if (!qrCode) return res.status(400).json({ success: false, message: 'QR Code is required' });

    const student = await Student.findOne({ qrCode, schoolName });
    if (!student) return res.status(404).json({ success: false, message: 'Invalid QR Code' });

    if (targetClass && student.className !== targetClass) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid Student! Ye student Class ${student.className} ka hai, aap Class ${targetClass} scan kar rahe hain.` 
      });
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
    const timeStr = today.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour12: true, hour: '2-digit', minute: '2-digit' });

    const localTime24 = today.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi', hour12: false });
    const [localHour, localMinute] = localTime24.split(':').map(Number);

    let status = 'present';
    if (localHour > 8 || (localHour === 8 && localMinute > 15)) {
      status = 'late';
    }

    const existingAttendance = await Attendance.findOne({ studentId: student._id, date: dateStr });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: `Already marked for ${student.name} at ${existingAttendance.timeIn}` });
    }

    await Attendance.create({ 
      studentId: student._id, 
      teacherId, 
      teacherName, 
      date: dateStr, 
      timeIn: timeStr, 
      status: status 
    });

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

// 🚀 Dashboard Stats (Sirf present aur late count honge)
const getDashboardStats = async (req, res) => {
  try {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); 
    const schoolName = req.teacher.schoolName;

    const totalStudents = await Student.countDocuments({ schoolName, isActive: true });

    const studentsOfSchool = await Student.find({ schoolName, isActive: true }).select('_id');
    const studentIds = studentsOfSchool.map(s => s._id);
    
    const presentTodayOfSchool = await Attendance.countDocuments({ 
      date: dateStr,
      studentId: { $in: studentIds },
      status: { $in: ['present', 'late'] } 
    });

    const absentToday = totalStudents - presentTodayOfSchool;

    res.status(200).json({ 
      success: true, 
      totalStudents, 
      presentToday: presentTodayOfSchool, 
      absentToday: absentToday < 0 ? 0 : absentToday 
    });
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
    const todayAttendance = await Attendance.find({ 
      date: dateStr,
      status: { $in: ['present', 'late'] }
    });

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

// @desc    Manually mark all unscanned students as absent
const markAbsentees = async (req, res) => {
  try {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
    const presentRecords = await Attendance.find({ date: dateStr }).select('studentId');
    const presentStudentIds = presentRecords.map(r => r.studentId.toString());

    const absentStudents = await Student.find({ schoolName: req.teacher.schoolName, isActive: true, _id: { $nin: presentStudentIds } });

    const absentRecords = absentStudents.map(student => ({
      studentId: student._id, teacherId: req.teacher._id, teacherName: req.teacher.name, date: dateStr, timeIn: '--:--', status: 'absent'
    }));

    if (absentRecords.length > 0) await Attendance.insertMany(absentRecords);
    res.status(200).json({ success: true, message: `${absentStudents.length} students marked as absent.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🚀 Aaj ke Absent Students ki list
const getTodayAbsentStudents = async (req, res) => {
  try {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
    const schoolName = req.teacher.schoolName;

    const absentRecords = await Attendance.find({ 
      date: dateStr, 
      status: 'absent' 
    }).populate('studentId', 'name rollNumber className section schoolName');

    const filtered = absentRecords.filter(record => 
      record.studentId && record.studentId.schoolName === schoolName
    ).map(record => ({
      _id: record.studentId._id,
      name: record.studentId.name,
      rollNumber: record.studentId.rollNumber,
      className: record.studentId.className,
      section: record.studentId.section,
    }));

    res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error('Absent Students Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Low Attendance Alert
const getLowAttendanceStudents = async (req, res) => {
  try {
    const { className } = req.query;
    const schoolName = req.teacher.schoolName;
    
    let query = { schoolName, isActive: true };
    if (className && className !== 'all') {
      query.className = className;
    }

    const students = await Student.find(query);
    
    const lowAttendanceList = [];
    const totalDays = 20; 

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

// 🚀 NAYA: Weekly Stats for Graph (Pichle 7 din ka data)
const getWeeklyStats = async (req, res) => {
  try {
    const schoolName = req.teacher.schoolName;
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];

    // School ke saare students ki IDs
    const studentsOfSchool = await Student.find({ schoolName, isActive: true }).select('_id');
    const studentIds = studentsOfSchool.map(s => s._id);

    // Pichle 7 din ka data nikaalein
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

      const count = await Attendance.countDocuments({
        date: dateStr,
        studentId: { $in: studentIds },
        status: { $in: ['present', 'late'] }
      });

      weeklyData.push({
        dayName: days[date.getDay()],
        date: dateStr,
        count: count
      });
    }

    res.status(200).json({ success: true, data: weeklyData });
  } catch (error) {
    console.error('Weekly Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  markAttendance, 
  getTodayAttendanceCount, 
  getDashboardStats, 
  getClassWiseStats, 
  markAbsentees, 
  getLowAttendanceStudents,
  getTodayAbsentStudents,
  getWeeklyStats // 🚀 Naya export
};