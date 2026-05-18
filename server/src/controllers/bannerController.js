const { Banner } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');

// Get active and scheduled banners for homepage slideshow
exports.getBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  
  // Find active banners
  // If startDate or endDate is defined, respect the schedule.
  const query = {
    isActive: true,
    $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] }
    ]
  };

  const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, banners });
});

// Admin: Get all banners for management panel
exports.getAdminBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, banners });
});

// Admin: Create a new banner
exports.createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
});

// Admin: Update a banner
exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!banner) throw new AppError('Banner not found', 404);
  res.json({ success: true, banner });
});

// Admin: Delete a banner
exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) throw new AppError('Banner not found', 404);
  res.json({ success: true, message: 'Banner deleted successfully' });
});

// Admin: Reorder banners
exports.reorderBanners = asyncHandler(async (req, res) => {
  const { bannerIds } = req.body;
  if (!bannerIds || !Array.isArray(bannerIds)) {
    throw new AppError('bannerIds array is required', 400);
  }

  // Bulk update sort orders
  const operations = bannerIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { sortOrder: index }
    }
  }));

  await Banner.bulkWrite(operations);
  res.json({ success: true, message: 'Banners reordered successfully' });
});
