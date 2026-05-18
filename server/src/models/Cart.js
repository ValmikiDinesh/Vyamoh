const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: mongoose.Schema.Types.ObjectId }, // variant subdoc _id
  quantity: { type: Number, required: true, min: 1, default: 1 },
  // Snapshot at time of add
  name: String,
  image: String,
  price: Number, // in paise
  color: String,
  frameSize: String,
  sku: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 }, // in paise
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// TTL index — expire abandoned carts after 7 days
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Virtual: subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
