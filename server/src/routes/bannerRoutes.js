const router = require('express').Router();
const banner = require('../controllers/bannerController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route
router.get('/', banner.getBanners);

// Protected Admin routes
router.use(authenticate, authorize('admin', 'superadmin'));
router.get('/admin', banner.getAdminBanners);
router.post('/', banner.createBanner);
router.put('/reorder', banner.reorderBanners);
router.put('/:id', banner.updateBanner);
router.delete('/:id', banner.deleteBanner);

module.exports = router;
