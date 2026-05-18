const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    desktopImage: { type: String, required: true }, // Cloudinary URL
    mobileImage: { type: String, required: true }, // Cloudinary URL
    video: String, // Optional Cloudinary Video URL
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/products' },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
