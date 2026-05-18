const router = require('express').Router();
const order = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', order.createOrder);
router.post('/verify-payment', order.verifyPayment);
router.post('/verify-cod-otp', order.verifyCodOtp);
router.get('/my-orders', order.getMyOrders);
router.get('/:id', order.getOrderById);
router.post('/:id/cancel', order.cancelOrder);

module.exports = router;
