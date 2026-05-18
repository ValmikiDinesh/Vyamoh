const { User, Order, OTP } = require('../../models');
const { AppError } = require('../../middleware/error');

// High-risk pincode zones (sample — expand with real data)
const HIGH_RISK_PINCODES = new Set([
  '110001', '110002', '400001', // sample high-fraud areas
]);

/**
 * Calculate COD risk score (0-100) for an order
 * Higher score = higher risk
 */
const calculateRiskScore = async ({ userId, orderAmount, shippingAddress, ip }) => {
  let score = 0;
  const factors = [];

  // 1. Order value risk (high-value COD = higher risk)
  const amountInRupees = orderAmount / 100;
  if (amountInRupees > 5000) {
    score += 20;
    factors.push('High order value (>₹5000)');
  } else if (amountInRupees > 2000) {
    score += 10;
    factors.push('Medium order value (>₹2000)');
  }

  // 2. Customer history
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      // New customer
      if (user.totalOrders === 0) {
        score += 15;
        factors.push('New customer (no order history)');
      }

      // High return rate
      if (user.totalOrders > 0) {
        const returnRate = user.totalReturns / user.totalOrders;
        if (returnRate > 0.5) {
          score += 25;
          factors.push('High return rate (>50%)');
        } else if (returnRate > 0.3) {
          score += 15;
          factors.push('Moderate return rate (>30%)');
        }
      }

      // COD abuse history
      if (user.codOrderCount > 0) {
        const codReturnRate = user.codReturnCount / user.codOrderCount;
        if (codReturnRate > 0.4) {
          score += 20;
          factors.push('High COD return rate (>40%)');
        }
      }

      // Recently created account
      const accountAge = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (accountAge < 1) {
        score += 15;
        factors.push('Account less than 24 hours old');
      }
    }
  } else {
    score += 20;
    factors.push('Guest checkout (no account)');
  }

  // 3. Pincode risk
  if (shippingAddress && HIGH_RISK_PINCODES.has(shippingAddress.pincode)) {
    score += 15;
    factors.push('High-risk delivery pincode');
  }

  // 4. Time-based risk (late night orders)
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 5) {
    score += 10;
    factors.push('Late night order (12AM-5AM)');
  }

  // 5. Address quality
  if (shippingAddress) {
    if (!shippingAddress.landmark) {
      score += 5;
      factors.push('No landmark provided');
    }
    if (!shippingAddress.addressLine2) {
      score += 3;
      factors.push('Incomplete address');
    }
  }

  // Clamp to 0-100
  score = Math.min(100, Math.max(0, score));

  // Determine risk level
  let riskLevel = 'low';
  if (score >= 60) riskLevel = 'high';
  else if (score >= 35) riskLevel = 'medium';

  return { score, riskLevel, factors, requiresOtp: score >= 60 };
};

// Generate and store OTP
const generateOTP = async (phone, purpose, orderId) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await OTP.findOneAndUpdate(
    { phone, purpose },
    { otp, purpose, orderId, attempts: 0, isVerified: false, expiresAt },
    { upsert: true, new: true }
  );

  // TODO: Send OTP via SMS (MSG91/Twilio integration)
  console.log(`[OTP] Generated for ${phone}: ${otp} (purpose: ${purpose})`);

  return { sent: true, expiresAt };
};

// Verify OTP
const verifyOTP = async (phone, otp, purpose) => {
  const record = await OTP.findOne({ phone, purpose, isVerified: false });

  if (!record) throw new AppError('No OTP found. Please request a new one.', 400);
  if (record.expiresAt < new Date()) throw new AppError('OTP expired. Please request a new one.', 400);
  if (record.attempts >= record.maxAttempts) throw new AppError('Too many attempts. Please request a new OTP.', 400);

  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    throw new AppError(`Invalid OTP. ${record.maxAttempts - record.attempts} attempts remaining.`, 400);
  }

  record.isVerified = true;
  await record.save();

  return { verified: true };
};

module.exports = { calculateRiskScore, generateOTP, verifyOTP };
