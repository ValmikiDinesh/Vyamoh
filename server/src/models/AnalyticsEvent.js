const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        'page_view', 'product_view', 'add_to_cart', 'remove_from_cart',
        'add_to_wishlist', 'checkout_start', 'checkout_complete',
        'payment_success', 'payment_failed', 'order_placed',
        'order_cancelled', 'order_returned', 'search', 'coupon_applied',
        'cart_abandoned',
      ],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    data: mongoose.Schema.Types.Mixed, // flexible payload
    ip: String,
    userAgent: String,
    referer: String,
  },
  { timestamps: true }
);

analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ user: 1, event: 1 });
analyticsEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
