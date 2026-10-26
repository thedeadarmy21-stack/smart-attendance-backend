const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/Teacher');

const createAccounts = async () => {
  try {
    console.log('⏳ Connecting to Database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected\n');

    // 1. Purane accounts delete karein (taake duplicate ka error na aaye)
    await Teacher.deleteMany({ username: { $in: ['sarkar', 'alpha'] } });
    console.log('🗑️  Old accounts deleted (if existed)\n');

    // 2. ADMIN Account Banayein
    const admin = await Teacher.create({
      name: 'Sir Bilal',
      username: 'sarkar',
      password: 'admin123', // 👈 Admin ka password
      schoolName: 'City School',
      role: 'admin'
    });
    console.log('✅ ADMIN Created Successfully!');
    console.log('   Username: sarkar');
    console.log('   Password: admin123');
    console.log('   Role: admin\n');

    // 3. TEACHER Account Banayein
    const teacher = await Teacher.create({
      name: 'Alpha Teacher',
      username: 'alpha',
      password: 'alpha123', // 👈 Teacher ka password
      schoolName: 'City School',
      role: 'teacher'
    });
    console.log('✅ TEACHER Created Successfully!');
    console.log('   Username: alpha');
    console.log('   Password: alpha123');
    console.log('   Role: teacher\n');

    console.log('🎉 Dono accounts successfully ban gaye hain!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAccounts();