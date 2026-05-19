const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const config = require('../config');
const { AppError } = require('../middleware/error');

const googleClient = new OAuth2Client(config.google.clientId);

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: config.jwt.expire });
  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpire });
  return { accessToken, refreshToken };
};

// Set token cookies
const setTokenCookies = (res, tokens) => {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

const register = async ({ name, email, password, phone }) => {
  if (!phone || !phone.trim()) {
    throw new AppError('Mobile number is required', 400);
  }
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, password, phone, authProvider: 'local' });
  const tokens = generateTokens(user._id);

  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

const login = async ({ email, password, ip }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  if (user.authProvider === 'google' && !user.password) {
    throw new AppError('Please use Google login for this account', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  if (!user.isActive) throw new AppError('Account is deactivated', 401);

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  await user.save();

  return { user, tokens };
};

const googleLogin = async ({ idToken, ip }) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google.clientId,
  });
  const { sub, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: sub,
      avatar: picture,
      authProvider: 'google',
      isEmailVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = sub;
    user.authProvider = 'google';
    user.isEmailVerified = true;
    if (!user.avatar) user.avatar = picture;
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  await user.save();

  return { user, tokens };
};

const refreshToken = async (token) => {
  if (!token) throw new AppError('Refresh token required', 401);

  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Reuse the existing valid refresh token to prevent multi-tab race conditions
  const accessToken = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: config.jwt.expire });
  const tokens = { accessToken, refreshToken: token };

  return { user, tokens };
};

const forgotPassword = async (email) => {
  const crypto = require('crypto');
  const user = await User.findOne({ email });
  if (!user) throw new AppError('No user found with that email address', 404);

  if (user.authProvider === 'google') {
    throw new AppError('This account uses Google Login. Please sign in with Google.', 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save();
  return { user, resetToken };
};

const resetPassword = async (token, newPassword) => {
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = null;
  await user.save();

  return user;
};

module.exports = { register, login, googleLogin, refreshToken, generateTokens, setTokenCookies, forgotPassword, resetPassword };
