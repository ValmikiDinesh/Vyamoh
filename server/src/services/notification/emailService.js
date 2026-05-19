const nodemailer = require('nodemailer');
const config = require('../../config');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mail = getTransporter();
    await mail.sendMail({ from: `"Vyamoh" <${config.smtp.user}>`, to, subject, html, text });
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const sendOrderConfirmation = async (order, user) => {
  const items = order.items.map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${(i.price*i.quantity/100).toLocaleString('en-IN')}</td></tr>`).join('');
  const html = `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><h1>🛍️ Order Confirmed!</h1><p>Hi ${user.name},</p><p>Order <strong>${order.orderNumber}</strong> placed successfully.</p><table style="width:100%;border-collapse:collapse;margin:20px 0;"><thead><tr style="background:#f5f5f5;"><th style="padding:10px;text-align:left;">Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${items}</tbody></table><p><strong>Total: ₹${(order.totalAmount/100).toLocaleString('en-IN')}</strong></p><p>Track at <a href="${config.clientUrl}/account/orders/${order._id}">Vyamoh</a></p></div>`;
  return sendEmail({ to: user.email, subject: `Order Confirmed: ${order.orderNumber}`, html });
};

const sendShippingNotification = async (order, user) => {
  const html = `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><h1>📦 Your Order is Shipped!</h1><p>Hi ${user.name}, Order <strong>${order.orderNumber}</strong> shipped.</p>${order.trackingId ? `<p>Tracking: <strong>${order.trackingId}</strong></p>` : ''}</div>`;
  return sendEmail({ to: user.email, subject: `Order Shipped: ${order.orderNumber}`, html });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
    <h2 style="color:#e85d3a;margin-bottom:20px;">🔒 Reset Your Password</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset the password for your Vyamoh account. Click the button below to set a new password:</p>
    <div style="margin:30px 0;text-align:center;">
      <a href="${resetUrl}" style="background:#e85d3a;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Reset Password</a>
    </div>
    <p style="color:#666666;font-size:12px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    <hr style="border:none;border-top:1px solid #eeeeee;margin:20px 0;" />
    <p style="color:#999999;font-size:12px;">Vyamoh Team</p>
  </div>`;
  return sendEmail({ to: user.email, subject: 'Reset your password - Vyamoh', html });
};

module.exports = { sendEmail, sendOrderConfirmation, sendShippingNotification, sendPasswordResetEmail };
