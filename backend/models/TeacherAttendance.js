const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    timeIn: {
      type: String, // HH:MM AM/PM
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent'], // ✅ Pehle se sahi hai
      default: 'present',
    },
  },
  { timestamps: true }
);

// Ek din me ek teacher ki sirf ek attendance ban sake
teacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);