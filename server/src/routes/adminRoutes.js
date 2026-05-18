const router = require('express').Router();
const admin = require('../controllers/adminController');
const invoice = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'superadmin'));
router.get('/dashboard', admin.getDashboardStats);
router.get('/sales-chart', admin.getSalesChart);
router.get('/orders', admin.getAllOrders);
router.put('/orders/:id/status', admin.updateOrderStatus);
router.get('/orders/:id/invoice', invoice.getInvoice);
router.post('/orders/bulk-invoices', invoice.bulkInvoices);
router.get('/users', admin.getAllUsers);

module.exports = router;
