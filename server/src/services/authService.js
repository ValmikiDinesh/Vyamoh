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
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const register = async ({ name, email, password, phone }) => {
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

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, tokens };
};

module.exports = { register, login, googleLogin, refreshToken, generateTokens, setTokenCookies };
