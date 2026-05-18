const router = require('express').Router();
const coupon = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/validate', authenticate, coupon.validateCoupon);
router.get('/', authenticate, authorize('admin', 'superadmin'), coupon.getCoupons);
router.post('/', authenticate, authorize('admin', 'superadmin'), coupon.createCoupon);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), coupon.updateCoupon);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), coupon.deleteCoupon);

module.exports = router;
