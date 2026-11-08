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

    // 1. Purane admin account ko delete karein (agar exist karta hai)
    await Teacher.deleteMany({ username: 'pacific' });
    console.log('🗑️  Old admin account deleted (if existed)\n');

    // 2. ADMIN Account Banayein
    const admin = await Teacher.create({
      name: 'Miss Saiqa', 
      username: 'pacific',       // 🚀 Naya Username
      password: 'thepacific',    // 🚀 Naya Password
      schoolName: 'THE PACIFIC CAMBRIDGE SCHOOL',
      role: 'admin'
    });
    console.log('✅ ADMIN Created Successfully!');
    console.log('   Name: Miss Saiqa');
    console.log('   Username: pacific');
    console.log('   Password: thepacific');
    console.log('   Role: admin\n');

    console.log('🎉 Admin account successfully ban gaya hai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAccounts();