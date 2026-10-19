const { Resend } = require('resend');

// Resend (Email) Setup
const resend = new Resend(process.env.RESEND_API_KEY);

// TextBee (SMS) Setup
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;

const sendWhatsAppMessage = async (targetEmail, phoneNumber, message) => {
  let emailSuccess = false;
  let smsSuccess = false;

  // 1. Email Bhejo (agar email hai to)
  if (targetEmail) {
    try {
      const data = await resend.emails.send({
        from: 'Smart School <onboarding@resend.dev>',
        to: targetEmail,
        subject: 'Smart School - Attendance Alert',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
            <h2 style="color: #0f766e; text-align: center;">Smart School</h2>
            <p style="font-size: 16px; color: #333;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from Smart School Attendance System.</p>
          </div>
        `,
      });
      console.log(`✅ Email sent to ${targetEmail}`);
      emailSuccess = true;
    } catch (error) {
      console.error('❌ Resend Email Error:', error.message);
    }
  }

  // 2. SMS Bhejo (agar phone number hai to)
  if (phoneNumber && TEXTBEE_API_KEY) {
    try {
      let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (cleanNumber.startsWith('0')) cleanNumber = '92' + cleanNumber.substring(1);

      const response = await fetch('https://api.textbee.dev/api/v1/gateway/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEXTBEE_API_KEY,
        },
        body: JSON.stringify({
          recipients: ['+' + cleanNumber],
          message: message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ SMS sent to ${cleanNumber} via TextBee`);
        smsSuccess = true;
      } else {
        console.error('❌ TextBee Error:', data);
      }
    } catch (error) {
      console.error('❌ TextBee Error:', error.message);
    }
  }

  return { success: emailSuccess || smsSuccess };
};

module.exports = { sendWhatsAppMessage };