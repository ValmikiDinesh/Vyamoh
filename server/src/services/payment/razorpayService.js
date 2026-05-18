const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../../config');
const { AppError } = require('../../middleware/error');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

// Create Razorpay order
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  const razorpay = getRazorpay();
  const options = {
    amount, // already in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    notes: notes || {},
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new AppError('Failed to create payment order: ' + error.message, 500);
  }
};

// Verify payment signature
const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpay_signature;
};

// Fetch payment details
const fetchPayment = async (paymentId) => {
  const razorpay = getRazorpay();
  return await razorpay.payments.fetch(paymentId);
};

// Initiate refund
const initiateRefund = async (paymentId, amount, notes) => {
  const razorpay = getRazorpay();
  return await razorpay.payments.refund(paymentId, {
    amount,
    notes: notes || {},
  });
};

module.exports = { createRazorpayOrder, verifyPaymentSignature, fetchPayment, initiateRefund };
