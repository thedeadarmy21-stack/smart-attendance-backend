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
      enum: ['all', 'class', 'student'],
      default: 'all',
    },
    targetClass: {
      type: String,
      default: '',
    },
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
    // 🚀 NAYA FEATURE: Future Baileys Integration ke liye (Reply System)
    status: {
      type: String,
      enum: ['sent', 'delivered', 'replied'],
      default: 'sent',
    },
    replies: [
      {
        senderPhone: { type: String, required: true },
        replyMessage: { type: String, required: true },
        receivedAt: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('BroadcastMessage', broadcastMessageSchema);