const router = require('express').Router();
const product = require('../controllers/productController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { uploadImages, uploadVideos } = require('../config/cloudinary');
const multer = require('multer');
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Public routes
router.get('/', optionalAuth, product.getProducts);
router.get('/featured', product.getFeaturedProducts);
router.get('/new-arrivals', product.getNewArrivals);
router.get('/bestsellers', product.getBestsellers);
router.get('/search-suggestions', product.searchSuggestions);
router.get('/:slug', optionalAuth, product.getProductBySlug);
router.get('/:id/recommendations', optionalAuth, product.getProductRecommendations);

// Admin routes
router.post('/', authenticate, authorize('admin', 'superadmin'), product.createProduct);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), product.updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), product.deleteProduct);
router.patch('/:id/toggle', authenticate, authorize('admin', 'superadmin'), product.toggleProduct);
router.post('/upload-images', authenticate, authorize('admin', 'superadmin'), uploadImages.array('images', 10), product.uploadImages);
router.post('/upload-videos', authenticate, authorize('admin', 'superadmin'), uploadVideos.array('videos', 5), product.uploadVideos);
router.post('/delete-media', authenticate, authorize('admin', 'superadmin'), product.deleteMedia);
router.post('/bulk-upload', authenticate, authorize('admin', 'superadmin'), memoryUpload.single('file'), product.bulkUpload);
router.post('/:id/ai-content', authenticate, authorize('admin', 'superadmin'), product.generateAIContent);
router.post('/:id/instagram-caption', authenticate, authorize('admin', 'superadmin'), product.generateInstaCaption);

module.exports = router;
