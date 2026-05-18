const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: String,
  price: { type: Number, required: true }, // stored in paise
  compareAtPrice: Number,
  stock: { type: Number, required: true, default: 0, min: 0 },
  images: [String], // Cloudinary URLs
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    brand: { type: String, required: true, default: 'Vyamoh', trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [String],

    // Media
    images: [String],
    thumbnail: String,
    videos: [String], // Cloudinary video URLs
    videoThumbnails: [String],

    // Pricing
    price: { type: Number, required: true }, // in paise
    salePrice: Number, // Sale price in paise
    compareAtPrice: Number, // MRP in paise
    costPrice: Number, // in paise

    sku: { type: String, trim: true },

    // Sunglasses Specifications
    isPolarized: { type: Boolean, default: false },
    specifications: {
      frameMaterial: { type: String, default: 'Acetate' },
      lensMaterial: { type: String, default: 'Polycarbonate' },
      frameSize: { type: String, default: 'Medium' },
      lensColor: { type: String, default: 'Black' },
      frameColor: { type: String, default: 'Matte Black' },
      frameShape: { type: String, default: 'wayfarer' },
      gender: { type: String, default: 'unisex', enum: ['men', 'women', 'unisex'] },
      uvProtection: { type: String, default: 'UV400' },
      weight: { type: Number, default: 28 }, // in grams
      lensTechnology: { type: String, default: 'Polarized TAC, Anti-Glare Coating' }
    },

    variants: [variantSchema],

    stockQuantity: { type: Number, default: 0 },
    totalStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    isOutOfStock: { type: Boolean, default: false },

    // Ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Status
    isActive: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },

    // SEO
    meta: {
      title: String,
      description: String,
      keywords: [String],
    },

    // Analytics
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0);
  } else {
    this.totalStock = this.stockQuantity || 0;
  }
  this.isOutOfStock = this.totalStock === 0;
  next();
});

productSchema.virtual('effectivePrice').get(function () {
  return this.salePrice || this.price;
});

productSchema.virtual('discountPercent').get(function () {
  const original = this.compareAtPrice || this.price;
  const current = this.salePrice || this.price;
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
});

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNewArrival: 1, createdAt: -1 });
productSchema.index({ purchaseCount: -1, rating: -1 });
productSchema.index({ isActive: 1, isEnabled: 1 });
productSchema.index({ 'specifications.gender': 1, 'specifications.frameShape': 1, 'specifications.frameMaterial': 1 });

module.exports = mongoose.model('Product', productSchema);
