// TextBee (SMS) Setup
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;

const sendWhatsAppMessage = async (targetEmail, phoneNumber, message) => {
  let smsSuccess = false;

  // SMS Bhejo (agar phone number hai to)
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
  } else {
    console.log('⚠️ No phone number provided, SMS not sent.');
  }

  return { success: smsSuccess };
};

module.exports = { sendWhatsAppMessage };