const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/error');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const { user, tokens } = await authService.register({ name, email, password, phone });
  authService.setTokenCookies(res, tokens);
  res.status(201).json({ success: true, user, accessToken: tokens.accessToken });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login({ email, password, ip: req.ip });
  authService.setTokenCookies(res, tokens);
  res.json({ success: true, user, accessToken: tokens.accessToken });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { user, tokens } = await authService.googleLogin({ idToken, ip: req.ip });
  authService.setTokenCookies(res, tokens);
  res.json({ success: true, user, accessToken: tokens.accessToken });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { user, tokens } = await authService.refreshToken(token);
  authService.setTokenCookies(res, tokens);
  res.json({ success: true, user, accessToken: tokens.accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
  if (req.user) { req.user.refreshToken = null; await req.user.save(); }
  res.json({ success: true, message: 'Logged out' });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  await req.user.save();
  res.json({ success: true, user: req.user });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const address = req.body;
  if (address.isDefault) { req.user.addresses.forEach((a) => (a.isDefault = false)); }
  req.user.addresses.push(address);
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
  Object.assign(addr, req.body);
  if (req.body.isDefault) { req.user.addresses.forEach((a) => { if (!a._id.equals(addr._id)) a.isDefault = false; }); }
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses.pull(req.params.addressId);
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});
