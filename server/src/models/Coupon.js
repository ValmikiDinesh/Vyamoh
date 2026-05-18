const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
    value: { type: Number, required: true }, // percentage (0-100) or fixed amount in paise
    minOrderAmount: { type: Number, default: 0 }, // in paise
    maxDiscount: Number, // cap for percentage coupons, in paise
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ user: mongoose.Schema.Types.ObjectId, usedAt: Date }],
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    excludeProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    newCustomersOnly: { type: Boolean, default: false },
    paymentMethods: [String], // restrict to specific payment methods
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
