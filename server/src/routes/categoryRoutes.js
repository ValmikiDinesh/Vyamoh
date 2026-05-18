const router = require('express').Router();
const cat = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', cat.getCategories);
router.get('/:slug', cat.getCategoryBySlug);
router.post('/', authenticate, authorize('admin', 'superadmin'), cat.createCategory);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), cat.updateCategory);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), cat.deleteCategory);

module.exports = router;
