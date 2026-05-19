const { Order, Product, User, AnalyticsEvent } = require('../models');
const { asyncHandler } = require('../middleware/error');

// Admin: Get all orders with filters
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, paymentMethod, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

// Admin: Update order status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingId, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = status;
  if (trackingId) order.trackingId = trackingId;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (status === 'delivered') { order.deliveredAt = new Date(); if (order.paymentMethod === 'cod') order.paymentStatus = 'cod_collected'; }
  
  if (status === 'fraud') {
    const user = await User.findById(order.user);
    if (user) {
      user.isActive = false;
      user.refreshToken = null;
      await user.save();
    }
  }

  order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id, timestamp: new Date() });
  await order.save();
  res.json({ success: true, order });
});

// Admin: Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

// Admin: Dashboard analytics
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = parseInt(period) || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalOrders, totalRevenue, ordersByStatus, paymentMethodStats, topProducts, recentOrders, totalUsers, totalProducts] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startDate } }),
    Order.aggregate([{ $match: { createdAt: { $gte: startDate }, paymentStatus: { $in: ['paid', 'cod_collected'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: startDate } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: startDate } } }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: startDate } } }, { $unwind: '$items' }, { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { totalSold: -1 } }, { $limit: 10 }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
  ]);

  const revenue = totalRevenue[0]?.total || 0;
  const codOrders = paymentMethodStats.find((p) => p._id === 'cod');
  const prepaidOrders = paymentMethodStats.filter((p) => p._id !== 'cod');
  const cancelledOrders = ordersByStatus.find((s) => s._id === 'cancelled')?.count || 0;
  const returnedOrders = ordersByStatus.find((s) => s._id === 'returned')?.count || 0;

  res.json({
    success: true,
    stats: {
      totalOrders, revenue, totalUsers, totalProducts,
      avgOrderValue: totalOrders > 0 ? Math.round(revenue / totalOrders) : 0,
      conversionRate: 0, // needs page view data
      codVsPrepaid: { cod: codOrders?.count || 0, prepaid: prepaidOrders.reduce((s, p) => s + p.count, 0) },
      returnRate: totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : 0,
      cancellationRate: totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0,
      ordersByStatus, paymentMethodStats, topProducts, recentOrders,
    },
  });
});

// Sales chart data
exports.getSalesChart = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: { $in: ['paid', 'cod_collected', 'cod_pending'] } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data });
});
