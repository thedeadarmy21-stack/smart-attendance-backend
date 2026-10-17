const nodemailer = require('nodemailer');

const sendWhatsAppMessage = async (targetEmail, message) => {
  try {
    // Vercel par connection drop na ho, isliye transporter har baar naya banate hain
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"Smart School" <${process.env.EMAIL_USER}>`,
      to: targetEmail, // 👈 Ab yahan student ke father ki email aayegi
      subject: 'Smart School - Attendance Alert',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #2563eb; text-align: center;">Smart School</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from Smart School Attendance System.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${targetEmail}: ${info.messageId}`);
    return { success: true, info };
    
  } catch (error) {
    console.error('❌ Email Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsAppMessage };