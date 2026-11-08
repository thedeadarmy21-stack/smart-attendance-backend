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
      // 🚀 FIX: 'absent' ke liye teacherId optional hai (System Auto), baaki ke liye required
      required: function() {
        return this.status !== 'absent';
      },
    },
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