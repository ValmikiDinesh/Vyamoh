const router = require('express').Router();
const mongoose = require('mongoose');
const { Review, Product, Order } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { authenticate } = require('../middleware/auth');

// Helper to update product average rating and count
const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  }
};

// Get all reviews (Admin only)
router.get('/admin/all', authenticate, asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
  if (!isAdmin) throw new AppError('Unauthorized', 403);

  const { page = 1, limit = 20, rating, search } = req.query;
  const query = {};

  if (rating) query.rating = parseInt(rating);

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { text: { $regex: search, $options: 'i' } },
      { reviewerName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(query),
  ]);

  res.json({
    success: true,
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

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

// Create a review (Allows fake name and media uploads for admins)
router.post('/product/:productId', authenticate, asyncHandler(async (req, res) => {
  const { rating, title, text, reviewerName, images, videos } = req.body;
  const productId = req.params.productId;
  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

  // Check if user already reviewed (admins can add multiple for testing/management if they want, but usually unique)
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing && !isAdmin) throw new AppError('You have already reviewed this product', 400);

  // If not admin, verify they purchased the product
  let isVerifiedPurchase = false;
  if (!isAdmin) {
    const order = await Order.findOne({ user: req.user._id, 'items.product': productId, status: 'delivered' });
    if (!order) throw new AppError('You can only review products you have purchased and received', 400);
    isVerifiedPurchase = true;
  } else {
    isVerifiedPurchase = true; // Admin reviews are verified by default
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    reviewerName: isAdmin ? reviewerName : undefined, // Only admin can specify custom reviewer name
    rating,
    title,
    text,
    images: images || [],
    videos: videos || [],
    isVerifiedPurchase,
  });

  await updateProductRatingStats(productId);

  res.status(201).json({ success: true, review });
}));

// Edit a review
router.put('/:reviewId', authenticate, asyncHandler(async (req, res) => {
  const { rating, title, text, reviewerName, images, videos } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
  const isOwner = review.user.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to edit this review', 403);
  }

  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (text) review.text = text;
  if (isAdmin && reviewerName !== undefined) review.reviewerName = reviewerName;
  if (images !== undefined) review.images = images;
  if (videos !== undefined) review.videos = videos;

  await review.save();
  await updateProductRatingStats(review.product);

  res.json({ success: true, review });
}));

// Delete a review
router.delete('/:reviewId', authenticate, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
  const isOwner = review.user.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to delete this review', 403);
  }

  const productId = review.product;
  await Review.findByIdAndDelete(req.params.reviewId);
  await updateProductRatingStats(productId);

  res.json({ success: true, message: 'Review deleted successfully' });
}));

module.exports = router;
