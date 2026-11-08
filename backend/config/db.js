const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS force karo

const mongoose = require('mongoose');

// 🚀 Vercel Serverless ke liye Connection Caching
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Agar pehle se connection hai, to wahi return karo
  if (cached.conn) {
    return cached.conn;
  }

  // Agar connection promise ban raha hai, to uska wait karo
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      console.log(`📦 Database: ${mongoose.connection.name}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Agar fail ho jaye, to dobara try karne do
    console.error(`❌ MongoDB Connection Error: ${e.message}`);
    process.exit(1);
  }

  return cached.conn;
};

module.exports = connectDB;