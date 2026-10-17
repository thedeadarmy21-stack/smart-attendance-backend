// Meta WhatsApp API Credentials
const PHONE_NUMBER_ID = '1417655098090429'; 
const ACCESS_TOKEN = 'EAAUt9zQ0Du0BSwoYoq8Egp05z4GLsAvZBijZByyhshck3ku5YL6T2N5aEokhmgbK5IbJsTojZC9g2YA99jBCE00lhCyF7k94lcGrlEO3cRTm9kmNdNHFUpEiLnGqwvGEfdiiZAcvin58joUYe3YQpYeznfWLlEkijFYnUlrR5S2ln9Kbn54BirO3N6KiXdm1aJ0JuWFc4pLoLzC9FdEWYTSXhE5JYj3KcdUkaB6e0SjKOBCPQiMwWlkItMbCwFPehjJDHgNKuhZCc17UDWYNJRZBnU0gZDZD';
const API_VERSION = 'v18.0';

const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // 1. Number ko clean karo (sirf digits rakho, + ya - hatao)
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Agar number 0 se shuru ho raha hai (jaise 0300...), to usko Pakistan code 92 me badlo
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '92' + cleanNumber.substring(1);
    }

    console.log(`Sending WhatsApp to: ${cleanNumber}`);

    // 2. Meta API ko request bhejo
    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanNumber,
        type: 'text',
        text: { body: message }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Meta WhatsApp Error:', data.error.message);
      return { success: false, error: data.error.message };
    }
    
    console.log(`✅ WhatsApp sent successfully to ${cleanNumber}`);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ WhatsApp Network Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsAppMessage };