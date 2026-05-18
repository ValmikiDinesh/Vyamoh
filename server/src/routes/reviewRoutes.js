const router = require('express').Router();
const { Review, Product, Order } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);
  res.json({ success: true, reviews, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
}));

// Create a review
router.post('/product/:productId', authenticate, asyncHandler(async (req, res) => {
  const { rating, title, text } = req.body;
  const productId = req.params.productId;

  // Check if user already reviewed
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw new AppError('You have already reviewed this product', 400);

  // Check if user purchased
  const order = await Order.findOne({ user: req.user._id, 'items.product': productId, status: 'delivered' });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    text,
    isVerifiedPurchase: !!order,
  });

  // Update product rating
  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  res.status(201).json({ success: true, review });
}));

module.exports = router;
