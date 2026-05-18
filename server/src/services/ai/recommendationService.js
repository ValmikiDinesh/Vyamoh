const { Product, Order, AnalyticsEvent } = require('../../models');

/**
 * Get product recommendations based on multiple signals:
 * 1. Co-purchased products (collaborative filtering)
 * 2. Same category products
 * 3. Popular products as fallback
 */
const getRecommendations = async (productId, userId, limit = 8) => {
  const product = await Product.findById(productId);
  if (!product) return [];

  let recommendations = [];

  // 1. Co-purchased products — find products bought together
  try {
    const coPurchased = await Order.aggregate([
      { $match: { 'items.product': product._id } },
      { $unwind: '$items' },
      { $match: { 'items.product': { $ne: product._id } } },
      { $group: { _id: '$items.product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    if (coPurchased.length > 0) {
      const ids = coPurchased.map((p) => p._id);
      const products = await Product.find({ _id: { $in: ids }, isActive: true })
        .select('name slug thumbnail price compareAtPrice rating reviewCount brand specifications.gender specifications.frameShape isPolarized')
        .limit(limit);
      recommendations.push(...products);
    }
  } catch (err) {
    console.error('Co-purchase recommendation error:', err.message);
  }

  // 2. Same category + similar specifications
  if (recommendations.length < limit) {
    const remaining = limit - recommendations.length;
    const existingIds = recommendations.map((r) => r._id).concat(product._id);
    const similar = await Product.find({
      _id: { $nin: existingIds },
      category: product.category,
      isActive: true,
      'specifications.gender': product.specifications?.gender,
    })
      .select('name slug thumbnail price compareAtPrice rating reviewCount brand specifications.gender specifications.frameShape isPolarized')
      .sort({ purchaseCount: -1, rating: -1 })
      .limit(remaining);
    recommendations.push(...similar);
  }

  // 3. Popular products fallback
  if (recommendations.length < limit) {
    const remaining = limit - recommendations.length;
    const existingIds = recommendations.map((r) => r._id).concat(product._id);
    const popular = await Product.find({
      _id: { $nin: existingIds },
      isActive: true,
    })
      .select('name slug thumbnail price compareAtPrice rating reviewCount brand specifications.gender specifications.frameShape isPolarized')
      .sort({ purchaseCount: -1, viewCount: -1 })
      .limit(remaining);
    recommendations.push(...popular);
  }

  return recommendations.slice(0, limit);
};

/**
 * Get personalized recommendations for a user based on browsing/purchase history
 */
const getPersonalizedRecommendations = async (userId, limit = 12) => {
  // Get user's recent views and purchases
  const recentEvents = await AnalyticsEvent.find({
    user: userId,
    event: { $in: ['product_view', 'add_to_cart', 'checkout_complete'] },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('product');

  const viewedProductIds = [...new Set(recentEvents.map((e) => e.product).filter(Boolean))];

  if (viewedProductIds.length === 0) {
    // Cold start — return trending products
    return await Product.find({ isActive: true })
      .select('name slug thumbnail price compareAtPrice rating reviewCount brand specifications.gender specifications.frameShape isPolarized')
      .sort({ purchaseCount: -1, viewCount: -1 })
      .limit(limit);
  }

  // Get categories and attributes from viewed products
  const viewedProducts = await Product.find({ _id: { $in: viewedProductIds } }).select('category specifications.gender specifications.frameShape');
  const categories = [...new Set(viewedProducts.map((p) => p.category?.toString()))];
  const genders = [...new Set(viewedProducts.map((p) => p.specifications?.gender).filter(Boolean))];

  return await Product.find({
    _id: { $nin: viewedProductIds },
    isActive: true,
    $or: [
      { category: { $in: categories } },
      { 'specifications.gender': { $in: genders } },
    ],
  })
    .select('name slug thumbnail price compareAtPrice rating reviewCount brand specifications.gender specifications.frameShape isPolarized')
    .sort({ rating: -1, purchaseCount: -1 })
    .limit(limit);
};

module.exports = { getRecommendations, getPersonalizedRecommendations };
