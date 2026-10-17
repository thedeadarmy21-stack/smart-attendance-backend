const { Resend } = require('resend');

// Tumhari Resend API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendWhatsAppMessage = async (targetEmail, message) => {
  try {
    const data = await resend.emails.send({
      from: 'Smart School <onboarding@resend.dev>', // Resend ka free domain
      to: targetEmail, // 👈 Yahan student ke father ki email aayegi
      subject: 'Smart School - Attendance Alert',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #2563eb; text-align: center;">Smart School</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from Smart School Attendance System.</p>
        </div>
      `,
    });

    console.log(`✅ Email sent to ${targetEmail}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Resend Email Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsAppMessage };