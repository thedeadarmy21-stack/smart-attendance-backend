const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    className: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: 'A',
    },
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true,
    },
    fatherWhatsApp: {
      type: String,
      required: [true, 'Father WhatsApp number is required'],
      trim: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ek school me roll number unique ho (class + section ke saath)
studentSchema.index(
  { rollNumber: 1, className: 1, section: 1, schoolName: 1 },
  { unique: true }
);

module.exports = mongoose.model('Student', studentSchema);