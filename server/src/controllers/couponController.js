const { Coupon } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError('Invalid coupon code', 400);

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) throw new AppError('Coupon expired', 400);
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached', 400);

  const userUsage = coupon.usedBy.filter((u) => u.user.toString() === req.user._id.toString());
  if (userUsage.length >= coupon.perUserLimit) throw new AppError('You have already used this coupon', 400);

  if (orderAmount < coupon.minOrderAmount) throw new AppError(`Minimum order of ₹${coupon.minOrderAmount / 100} required`, 400);

  if (coupon.newCustomersOnly && req.user.totalOrders > 0) throw new AppError('Coupon for new customers only', 400);

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.floor((orderAmount * coupon.value) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }

  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount }, message: `Coupon applied! You save ₹${(discount / 100).toLocaleString('en-IN')}` });
});

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ success: true, coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});
