const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Attendance = require('./models/Attendance');
const TeacherAttendance = require('./models/TeacherAttendance');

const OLD_SCHOOL_NAME = 'City School';
const NEW_SCHOOL_NAME = 'THE PACIFIC CAMBRIDGE SCHOOL';

const updateSchoolName = async () => {
  try {
    console.log('⏳ Connecting to Database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected\n');

    // 1. Students update karein
    const studentResult = await Student.updateMany(
      { schoolName: OLD_SCHOOL_NAME },
      { $set: { schoolName: NEW_SCHOOL_NAME } }
    );
    console.log(`✅ ${studentResult.modifiedCount} Students updated.`);

    // 2. Teachers update karein
    const teacherResult = await Teacher.updateMany(
      { schoolName: OLD_SCHOOL_NAME },
      { $set: { schoolName: NEW_SCHOOL_NAME } }
    );
    console.log(`✅ ${teacherResult.modifiedCount} Teachers updated.`);

    // 3. Attendances update karein (Agar school name store ho raha ho)
    // Note: Aapke Attendance model mein direct schoolName nahi hai, 
    // isliye filhal skip kar rahe hain.

    console.log('\n🎉 Saara data successfully update ho gaya hai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateSchoolName();