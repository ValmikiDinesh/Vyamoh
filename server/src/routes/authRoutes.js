const router = require('express').Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/google', auth.googleLogin);
router.post('/refresh', auth.refreshToken);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/logout', authenticate, auth.logout);
router.get('/profile', authenticate, auth.getProfile);
router.put('/profile', authenticate, auth.updateProfile);
router.post('/addresses', authenticate, auth.addAddress);
router.put('/addresses/:addressId', authenticate, auth.updateAddress);
router.delete('/addresses/:addressId', authenticate, auth.deleteAddress);

module.exports = router;
