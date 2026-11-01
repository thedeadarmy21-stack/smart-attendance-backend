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
      trim: true,
    },
    // 🚀 FIX: Email ab zaroori nahi hai
    fatherEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: '',
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

studentSchema.index(
  { rollNumber: 1, className: 1, section: 1, schoolName: 1 },
  { unique: true }
);

module.exports = mongoose.model('Student', studentSchema);