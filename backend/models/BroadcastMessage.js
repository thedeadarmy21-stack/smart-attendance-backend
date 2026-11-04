const mongoose = require('mongoose');

const broadcastMessageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    targetType: {
      type: String,
      enum: ['all', 'class', 'student'], // 🚀 'student' add kiya
      default: 'all',
    },
    targetClass: {
      type: String,
      default: '',
    },
    // 🚀 NAYA: Kis student ko message gaya (History ke liye)
    targetStudentName: {
      type: String,
      default: '',
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    sentByName: {
      type: String,
      default: 'Admin',
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    schoolName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BroadcastMessage', broadcastMessageSchema);