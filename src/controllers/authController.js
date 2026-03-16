const crypto = require('crypto');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { signToken } = require('../utils/jwt');
const { isEmail } = require('../utils/validation');

const MIN_PASSWORD_LENGTH = 8;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (!isEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = await User.create({ name, email: normalizedEmail, passwordHash: password });
  await Wallet.create({ user: user._id, currency: 'USD' });

  const token = signToken({ sub: user._id, role: user.role });
  return res.status(201).json({ token, user: user.toJSON() });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!isEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is not active' });
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user._id, role: user.role });
  return res.json({ token, user: user.toJSON() });
};

const me = async (req, res) => {
  return res.json({ user: req.user.toJSON() });
};

const updateMe = async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ error: 'Provide name and/or email' });
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (email && email.toLowerCase() !== req.user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    req.user.email = email.toLowerCase();
  }

  if (name) {
    req.user.name = name.trim();
  }

  await req.user.save();
  return res.json({ user: req.user.toJSON() });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = newPassword;
  await user.save();

  return res.json({ message: 'Password updated successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordResetTokenHash +passwordResetExpiresAt'
  );

  if (!user) {
    return res.json({ message: 'If the email exists, a reset token has been generated.' });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  // This app uses manual admin operations; expose token for manual delivery in non-production.
  const payload = { message: 'Reset token generated. Provide it to the user securely.' };
  if (process.env.NODE_ENV !== 'production') {
    payload.resetToken = resetToken;
  }

  return res.json(payload);
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'token and newPassword are required' });
  }
  if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  user.passwordHash = newPassword;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  return res.json({ message: 'Password reset successful' });
};

module.exports = {
  register,
  login,
  me,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
