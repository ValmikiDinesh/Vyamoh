const config = require('../../config');

// WhatsApp Business API integration (placeholder — activate with real credentials)
const sendWhatsAppMessage = async (phone, templateName, params) => {
  const token = config.whatsapp.apiToken;
  const phoneId = config.whatsapp.phoneId;
  if (!token || token.startsWith('your_')) {
    console.log(`[WhatsApp Mock] To: ${phone}, Template: ${templateName}, Params:`, params);
    return { sent: false, mock: true };
  }
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to: `91${phone}`, type: 'template',
        template: { name: templateName, language: { code: 'en' }, components: [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: p })) }] },
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('WhatsApp error:', error.message);
    return { sent: false, error: error.message };
  }
};

const sendOrderConfirmationWhatsApp = (phone, orderNumber, total) => sendWhatsAppMessage(phone, 'order_confirmation', [orderNumber, `₹${(total / 100).toLocaleString('en-IN')}`]);
const sendShippingWhatsApp = (phone, orderNumber, trackingId) => sendWhatsAppMessage(phone, 'order_shipped', [orderNumber, trackingId || 'N/A']);

module.exports = { sendWhatsAppMessage, sendOrderConfirmationWhatsApp, sendShippingWhatsApp };
