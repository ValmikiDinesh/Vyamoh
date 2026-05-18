const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: mongoose.Schema.Types.ObjectId,
  quantity: { type: Number, required: true, min: 1 },
  // Immutable snapshot
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true }, // in paise
  sku: String,
  color: String,
  frameSize: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    // Pricing (all in paise)
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Shipping
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi', 'cod', 'card', 'netbanking', 'wallet'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cod_pending', 'cod_collected', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedBy: mongoose.Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Tracking
    trackingId: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    deliveredAt: Date,

    // Coupon
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: String,

    // Fraud
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    otpVerified: { type: Boolean, default: false },
    customerIp: String,

    // Notes
    customerNote: String,
    adminNote: String,

    // Cancellation / Return
    cancellationReason: String,
    returnReason: String,
    refundAmount: Number,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Generate order number
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const prefix = 'VYM';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
