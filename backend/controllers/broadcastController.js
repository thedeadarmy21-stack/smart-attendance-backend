const Student = require('../models/Student');
const BroadcastMessage = require('../models/BroadcastMessage');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// @desc    Bulk Message bhejein (All ya Specific Class)
// @route   POST /api/broadcast/send
// @access  Private (Admin only)
const sendBroadcast = async (req, res) => {
  try {
    const { message, targetType, targetClass } = req.body;
    const adminId = req.teacher._id;
    const adminName = req.teacher.name;
    const schoolName = req.teacher.schoolName;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 🚀 Target Students fetch karein
    let query = { schoolName, isActive: true };
    if (targetType === 'class' && targetClass) {
      query.className = targetClass;
    }

    const students = await Student.find(query);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for this target' });
    }

    // 🚀 Har student ke parent ko message bhejein
    let successCount = 0;
    let failedCount = 0;

    for (const student of students) {
      try {
        // Agar parent ka email ya WhatsApp number mojood hai
        if (student.fatherEmail || student.fatherWhatsApp) {
          await sendWhatsAppMessage(student.fatherEmail, student.fatherWhatsApp, message);
          successCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
        console.error(`Failed to send to ${student.name}:`, err.message);
      }
    }

    // 🚀 History save karein
    const broadcast = await BroadcastMessage.create({
      message,
      targetType,
      targetClass: targetType === 'class' ? targetClass : '',
      sentBy: adminId,
      sentByName: adminName,
      totalRecipients: students.length,
      successCount,
      failedCount,
      schoolName,
    });

    res.status(200).json({
      success: true,
      message: `Message sent to ${successCount} parents (${failedCount} failed)`,
      broadcast,
    });
  } catch (error) {
    console.error('Broadcast Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Purane Broadcast Messages ki history
// @route   GET /api/broadcast/history
// @access  Private (Admin only)
const getBroadcastHistory = async (req, res) => {
  try {
    const history = await BroadcastMessage.find({ schoolName: req.teacher.schoolName })
      .sort({ createdAt: -1 })
      .limit(50); // Sirf last 50 messages

    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendBroadcast, getBroadcastHistory };