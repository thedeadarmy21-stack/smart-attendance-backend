const PHONE_NUMBER_ID = '1417655098090429'; 
const ACCESS_TOKEN = 'EAAUt9zQ0Du0BSwoYoq8Egp05z4GLsAvZBijZByyhshck3ku5YL6T2N5aEokhmgbK5IbJsTojZC9g2YA99jBCE00lhCyF7k94lcGrlEO3cRTm9kmNdNHFUpEiLnGqwvGEfdiiZAcvin58joUYe3YQpYeznfWLlEkijFYnUlrR5S2ln9Kbn54BirO3N6KiXdm1aJ0JuWFc4pLoLzC9FdEWYTSXhE5JYj3KcdUkaB6e0SjKOBCPQiMwWlkItMbCwFPehjJDHgNKuhZCc17UDWYNJRZBnU0gZDZD';
const API_VERSION = 'v18.0';

const sendWhatsAppMessage = async (phoneNumber, studentName, rollNumber, timeIn) => {
  try {
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '92' + cleanNumber.substring(1);
    }

    // Template ke hisaab se message bhejo
    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanNumber,
        type: 'template',
        template: {
          name: 'attendance_alert', // Jo template name tumne Meta par rakha
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: studentName },   // {{1}}
                { type: 'text', text: rollNumber },    // {{2}}
                { type: 'text', text: timeIn }         // {{3}}
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error('❌ Meta Template Error:', data.error.message);
      return { success: false, error: data.error.message };
    }
    console.log(`✅ WhatsApp Template sent to ${cleanNumber}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsAppMessage };