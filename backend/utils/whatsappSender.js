const nodemailer = require('nodemailer');

// Gmail SMTP setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS ke liye false
  auth: {
    user: process.env.EMAIL_USER, // Tumhara Gmail address
    pass: process.env.EMAIL_PASS, // 16-character App Password
  },
});

const sendWhatsAppMessage = async (phoneNumber, message) => {
  // Note: Function ka naam wahi rakha hai taaki controller me change na karna pade
  // Lekin ab ye Email bhejega, WhatsApp nahi.
  
  try {
    // Filhal number ki jagah hum email bhej rahe hain
    // Demo ke liye, phoneNumber ki jagah tum apna email daal sakte ho
    // ya database me father ke email ki field add karni padegi.
    
    const mailOptions = {
      from: `"Smart School" <${process.env.EMAIL_USER}>`,
      to: process.env.DEMO_EMAIL, // 👈 Demo ke liye apna email yahan daalo
      subject: 'Smart School - Attendance Alert',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563eb;">Smart School</h2>
          <p style="font-size: 16px;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated message from Smart School Attendance System.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${process.env.DEMO_EMAIL}: ${info.messageId}`);
    return { success: true, info };
    
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsAppMessage };