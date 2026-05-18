const router = require('express').Router();
const cart = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', cart.getCart);
router.post('/add', cart.addToCart);
router.put('/items/:itemId', cart.updateCartItem);
router.delete('/items/:itemId', cart.removeFromCart);
router.delete('/clear', cart.clearCart);

module.exports = router;
