const router = require('express').Router();
const { Newsletter } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');

router.post('/subscribe', asyncHandler(async (req, res) => {
  const { email, source = 'website' } = req.body;
  if (!email) throw new AppError('Email is required', 400);

  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.isSubscribed) return res.json({ success: true, message: 'Already subscribed!' });
    existing.isSubscribed = true;
    existing.subscribedAt = new Date();
    existing.unsubscribedAt = null;
    await existing.save();
    return res.json({ success: true, message: 'Welcome back! You are re-subscribed.' });
  }

  await Newsletter.create({ email: email.toLowerCase(), source });
  res.status(201).json({ success: true, message: 'Successfully subscribed!' });
}));

router.post('/unsubscribe', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);
  const sub = await Newsletter.findOne({ email: email.toLowerCase() });
  if (!sub) throw new AppError('Email not found', 404);
  sub.isSubscribed = false;
  sub.unsubscribedAt = new Date();
  await sub.save();
  res.json({ success: true, message: 'Unsubscribed successfully' });
}));

module.exports = router;
