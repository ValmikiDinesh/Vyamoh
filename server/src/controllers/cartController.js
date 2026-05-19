const { Cart, Product } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug thumbnail isActive isEnabled totalStock');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive || !product.isEnabled) throw new AppError('Product not found or unavailable', 404);

  let variant = null;
  let price = product.salePrice || product.price;
  let image = product.thumbnail || product.images?.[0];
  let color = '', frameSize = '', sku = '';

  if (variantId) {
    variant = product.variants.id(variantId);
    if (!variant || !variant.isActive) throw new AppError('Variant not found', 404);
    if (variant.stock < quantity) throw new AppError('Insufficient stock', 400);
    price = variant.price;
    color = variant.color;
    frameSize = variant.frameSize;
    sku = variant.sku;
    image = variant.images?.[0] || image;
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex((i) => i.product.toString() === productId && (!variantId || i.variant?.toString() === variantId));

  if (existingIdx > -1) {
    cart.items[existingIdx].quantity += quantity;
    cart.items[existingIdx].price = price;
  } else {
    cart.items.push({ product: productId, variant: variantId, quantity, name: product.name, image, price, color, frameSize, sku });
  }

  cart.updatedAt = new Date();
  await cart.save();
  res.json({ success: true, cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError('Item not found in cart', 404);

  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }

  cart.updatedAt = new Date();
  await cart.save();
  res.json({ success: true, cart });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);
  cart.items.pull(req.params.itemId);
  cart.updatedAt = new Date();
  await cart.save();
  res.json({ success: true, cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) { cart.items = []; cart.coupon = null; cart.couponCode = null; cart.couponDiscount = 0; await cart.save(); }
  res.json({ success: true, message: 'Cart cleared' });
});
