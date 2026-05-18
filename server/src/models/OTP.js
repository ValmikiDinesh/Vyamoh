const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['cod_verification', 'login', 'registration', 'password_reset'], required: true },
    orderId: mongoose.Schema.Types.ObjectId,
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    isVerified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL — auto-delete after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, purpose: 1 });

module.exports = mongoose.model('OTP', otpSchema);
