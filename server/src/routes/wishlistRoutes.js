const router = require('express').Router();
const wishlist = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', wishlist.getWishlist);
router.post('/toggle', wishlist.toggleWishlist);

module.exports = router;
