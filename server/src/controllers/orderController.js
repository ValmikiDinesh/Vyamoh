const { Order, Cart, Product, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/payment/razorpayService');
const { calculateRiskScore, generateOTP, verifyOTP } = require('../services/fraud/fraudService');
const { sendOrderConfirmation } = require('../services/notification/emailService');
const { sendOrderConfirmationWhatsApp } = require('../services/notification/whatsappService');

exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, customerNote, couponCode } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

  // Calculate totals
  let subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let shippingCost = subtotal >= 99900 ? 0 : 4900; // Free shipping over ₹999
  let couponDiscount = cart.couponDiscount || 0;
  let totalAmount = subtotal + shippingCost - couponDiscount;

  // Fraud check for COD
  let riskResult = { score: 0, riskLevel: 'low', requiresOtp: false };
  if (paymentMethod === 'cod') {
    riskResult = await calculateRiskScore({ userId: req.user._id, orderAmount: totalAmount, shippingAddress, ip: req.ip });
    if (riskResult.requiresOtp && !req.body.otpVerified) {
      await generateOTP(shippingAddress.phone, 'cod_verification');
      return res.status(200).json({ success: true, requiresOtp: true, riskLevel: riskResult.riskLevel, message: 'OTP sent for verification' });
    }
  }

  // Deduct inventory atomically
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isEnabled) throw new AppError(`Product ${item.name} is no longer available`, 400);
    if (item.variant) {
      const variant = product.variants.id(item.variant);
      if (!variant || variant.stock < item.quantity) throw new AppError(`Insufficient stock for ${item.name}`, 400);
      variant.stock -= item.quantity;
    }
    product.purchaseCount += item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((i) => ({ product: i.product, variant: i.variant, quantity: i.quantity, name: i.name, image: i.image, price: i.price, sku: i.sku, color: i.color, frameSize: i.frameSize })),
    subtotal, shippingCost, couponDiscount, totalAmount, shippingAddress, paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
    status: 'pending', customerNote,
    coupon: cart.coupon, couponCode: cart.couponCode || couponCode,
    riskScore: riskResult.score, riskLevel: riskResult.riskLevel, otpVerified: !!req.body.otpVerified, customerIp: req.ip,
    statusHistory: [{ status: 'pending', note: 'Order placed', timestamp: new Date() }],
  });

  // Update user stats
  req.user.totalOrders += 1;
  if (paymentMethod === 'cod') req.user.codOrderCount += 1;
  req.user.lastOrderAt = new Date();
  await req.user.save();

  // Clear cart
  cart.items = []; cart.coupon = null; cart.couponCode = null; cart.couponDiscount = 0;
  await cart.save();

  // Create Razorpay order if online payment
  let razorpayOrder = null;
  if (paymentMethod !== 'cod') {
    razorpayOrder = await createRazorpayOrder({ amount: totalAmount, receipt: order.orderNumber, notes: { orderId: order._id.toString() } });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
  }

  // Send notifications (async, don't block response)
  sendOrderConfirmation(order, req.user).catch(console.error);
  if (shippingAddress.phone) sendOrderConfirmationWhatsApp(shippingAddress.phone, order.orderNumber, totalAmount).catch(console.error);

  res.status(201).json({ success: true, order, razorpayOrder });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const isValid = verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!isValid) throw new AppError('Payment verification failed', 400);

  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.statusHistory.push({ status: 'confirmed', note: 'Payment verified', timestamp: new Date() });
  await order.save();

  res.json({ success: true, order });
});

exports.verifyCodOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  await verifyOTP(phone, otp, 'cod_verification');
  res.json({ success: true, otpVerified: true });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, order });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  if (!['pending', 'confirmed'].includes(order.status)) throw new AppError('Order cannot be cancelled at this stage', 400);
  order.status = 'cancelled';
  order.cancellationReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', note: order.cancellationReason, timestamp: new Date() });
  await order.save();
  // Restore inventory
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product && item.variant) { const v = product.variants.id(item.variant); if (v) v.stock += item.quantity; await product.save(); }
  }
  res.json({ success: true, order });
});
