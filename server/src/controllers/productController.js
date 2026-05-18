const { Product, Category } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { generateProductContent, generateInstagramCaption } = require('../services/ai/contentService');
const { getRecommendations } = require('../services/ai/recommendationService');
const { deleteAsset, getVideoThumbnail } = require('../config/cloudinary');
const XLSX = require('xlsx');

// Sanitize request payload by converting empty strings to undefined
const sanitizeEmptyStrings = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === '') {
        clean[key] = undefined;
      } else if (typeof obj[key] === 'object') {
        clean[key] = sanitizeEmptyStrings(obj[key]);
      } else {
        clean[key] = obj[key];
      }
    }
  }
  return clean;
};

// ─── PUBLIC ENDPOINTS ───

exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, gender, frameShape, frameMaterial, polarized, minPrice, maxPrice, sort, search, brand, subcategory } = req.query;
  const query = { isActive: true, isEnabled: true };

  if (category) {
    // Support slug-based category filter
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category = cat._id;
    else query.category = category;
  }
  if (subcategory) query.subcategory = subcategory;
  if (gender) query['specifications.gender'] = gender;
  if (frameShape) query['specifications.frameShape'] = frameShape;
  if (frameMaterial) query['specifications.frameMaterial'] = frameMaterial;
  if (polarized) query.isPolarized = polarized === 'true';
  if (brand) query.brand = { $regex: brand, $options: 'i' };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice) * 100;
    if (maxPrice) query.price.$lte = parseInt(maxPrice) * 100;
  }
  if (search) query.$text = { $search: search };

  let sortObj = { createdAt: -1 };
  if (sort === 'price_asc') sortObj = { price: 1 };
  else if (sort === 'price_desc') sortObj = { price: -1 };
  else if (sort === 'rating') sortObj = { rating: -1 };
  else if (sort === 'popular') sortObj = { purchaseCount: -1 };
  else if (sort === 'newest') sortObj = { createdAt: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(query).populate('category', 'name slug').sort(sortObj).skip(skip).limit(parseInt(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true, products, pagination: {
      page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { slug: req.params.slug, isActive: true },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('category', 'name slug').populate('subcategory', 'name slug');
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.getProductRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await getRecommendations(req.params.id, req.user?._id);
  res.json({ success: true, recommendations });
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isEnabled: true, isFeatured: true }).populate('category', 'name slug').limit(12);
  res.json({ success: true, products });
});

exports.getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isEnabled: true, isNewArrival: true }).populate('category', 'name slug').sort({ createdAt: -1 }).limit(12);
  res.json({ success: true, products });
});

exports.getBestsellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isEnabled: true }).populate('category', 'name slug').sort({ purchaseCount: -1 }).limit(12);
  res.json({ success: true, products });
});

exports.searchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });
  const products = await Product.find({ isActive: true, name: { $regex: q, $options: 'i' } }).select('name slug thumbnail price brand').limit(6);
  const categories = await Category.find({ isActive: true, name: { $regex: q, $options: 'i' } }).select('name slug').limit(3);
  res.json({ success: true, suggestions: { products, categories } });
});

// ─── ADMIN ENDPOINTS ───

exports.createProduct = asyncHandler(async (req, res) => {
  const sanitizedBody = sanitizeEmptyStrings(req.body);
  const product = await Product.create(sanitizedBody);
  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const sanitizedBody = sanitizeEmptyStrings(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, sanitizedBody, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deactivated' });
});

exports.toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  product.isEnabled = !product.isEnabled;
  await product.save();
  res.json({ success: true, product, message: `Product ${product.isEnabled ? 'enabled' : 'disabled'}` });
});

// Upload images to Cloudinary
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError('No images uploaded', 400);
  const imageUrls = req.files.map((f) => f.path);
  res.json({ success: true, images: imageUrls });
});

// Upload videos to Cloudinary
exports.uploadVideos = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError('No videos uploaded', 400);
  const videos = req.files.map((f) => ({
    url: f.path,
    thumbnail: getVideoThumbnail(f.filename),
  }));
  res.json({ success: true, videos });
});

// Delete media from Cloudinary
exports.deleteMedia = asyncHandler(async (req, res) => {
  const { publicId, resourceType = 'image' } = req.body;
  if (!publicId) throw new AppError('Public ID required', 400);
  await deleteAsset(publicId, resourceType);
  res.json({ success: true, message: 'Media deleted' });
});

// Bulk upload products via Excel
exports.bulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No Excel file uploaded', 400);

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) throw new AppError('Excel file is empty', 400);

  const results = { created: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Find or skip category
      let categoryId = null;
      if (row.category) {
        const cat = await Category.findOne({ name: { $regex: new RegExp(`^${row.category}$`, 'i') } });
        categoryId = cat?._id;
      }

      await Product.create({
        name: row.name || row.Name,
        description: row.description || row.Description || 'No description',
        brand: row.brand || row.Brand || 'Vyamoh',
        price: Math.round((parseFloat(row.price || row.Price || 0)) * 100),
        salePrice: row.salePrice || row['Sale Price'] ? Math.round(parseFloat(row.salePrice || row['Sale Price']) * 100) : undefined,
        compareAtPrice: row.mrp || row.MRP ? Math.round(parseFloat(row.mrp || row.MRP) * 100) : undefined,
        sku: row.sku || row.SKU || '',
        stockQuantity: parseInt(row.stock || row.Stock || row.stockQuantity || 0),
        category: categoryId,
        tags: (row.tags || row.Tags || '').split(',').map(t => t.trim()).filter(Boolean),
        attributes: {
          gender: row.gender || row.Gender || 'unisex',
          weight: row.weight || row.Weight ? parseFloat(row.weight || row.Weight) : undefined,
        },
        isFeatured: row.featured === 'yes' || row.featured === true,
        isNewArrival: row.newArrival === 'yes' || row.newArrival === true,
      });
      results.created++;
    } catch (err) {
      results.failed++;
      results.errors.push({ row: i + 2, name: row.name || row.Name, error: err.message });
    }
  }

  res.json({ success: true, results });
});

// AI content generation
exports.generateAIContent = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  const content = await generateProductContent(product);
  res.json({ success: true, content });
});

exports.generateInstaCaption = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  const caption = generateInstagramCaption(product);
  res.json({ success: true, caption });
});
