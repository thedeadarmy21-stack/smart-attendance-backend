const Student = require('../models/Student');
const { generateQRId, generateQRImage } = require('../utils/qrGenerator');

// @desc    Naya student add karo (aur QR generate karo)
// @route   POST /api/students/add
// @access  Private (Sirf logged-in teacher)
const addStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      className,
      section,
      fatherName,
      fatherWhatsApp,
      fatherEmail, // 👈 Email receive kar rahe hain
    } = req.body;

    // 1. Validation (Email zaroori hai, WhatsApp optional)
    if (
      !name ||
      !rollNumber ||
      !className ||
      !fatherName ||
      !fatherEmail
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including Email',
      });
    }

    // 2. Check karo student pehle se hai ya nahi
    const existingStudent = await Student.findOne({
      rollNumber,
      className,
      section: section || 'A',
      schoolName: req.teacher.schoolName,
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'This student already exists in this class',
      });
    }

    // 3. Unique QR ID banao
    const qrId = generateQRId(rollNumber, className, section || 'A');

    // 4. Student create karo
    const student = await Student.create({
      name,
      rollNumber,
      className,
      section: section || 'A',
      fatherName,
      fatherWhatsApp: fatherWhatsApp || '', // Agar number nahi diya to khali save hoga
      fatherEmail,
      qrCode: qrId,
      schoolName: req.teacher.schoolName,
    });

    // 5. QR Image (Base64) banao
    const qrImageDataUrl = await generateQRImage(qrId);

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.className,
        section: student.section,
        fatherName: student.fatherName,
        fatherEmail: student.fatherEmail,
        qrCode: student.qrCode,
        qrImage: qrImageDataUrl,
      },
    });
  } catch (error) {
    console.error('Add Student Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while adding student',
      error: error.message,
    });
  }
};

// @desc    Saare students dekho
// @route   GET /api/students
// @access  Private (Sirf logged-in teacher)
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({
      schoolName: req.teacher.schoolName,
    }).sort({ className: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = { addStudent, getStudents };