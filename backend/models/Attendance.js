const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    // 🚀 NAYA: Teacher ka naam bhi save karenge (history mein dikhane ke liye)
    teacherName: {
      type: String,
      default: 'Unknown',
    },
    date: {
      type: String,
      required: true,
    },
    timeIn: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent'],
      default: 'present',
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);