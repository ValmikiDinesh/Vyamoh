const { Wishlist } = require('../models');
const { asyncHandler } = require('../middleware/error');

exports.getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name slug thumbnail price compareAtPrice rating brand attributes.gender');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.json({ success: true, wishlist });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  const idx = wishlist.products.indexOf(productId);
  if (idx > -1) {
    wishlist.products.splice(idx, 1);
  } else {
    wishlist.products.push(productId);
  }
  await wishlist.save();
  res.json({ success: true, wishlist, added: idx === -1 });
});
