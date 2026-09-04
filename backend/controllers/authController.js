const validator = require('validator');
const User = require('../models/User');
const { sanitizeUser, signToken } = require('../utils/security');
const { createResetToken, hashResetToken } = require('../utils/resetToken');
const { sendPasswordResetEmail } = require('../services/emailService');

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, confirmPassword } = req.body || {};
    if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
    if (!validator.isEmail(String(email || ''))) return res.status(400).json({ message: 'A valid email is required' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters and include a number' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, phone: phone?.trim(), password });
    return res.status(201).json({ user: sanitizeUser(user), token: signToken(user) });
  } catch (error) { return next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Incorrect email or password' });
    return res.json({ user: sanitizeUser(user), token: signToken(user) });
  } catch (error) { return next(error); }
}

async function me(req, res) { return res.json({ user: sanitizeUser(req.user) }); }

async function forgotPassword(req, res, next) {
  const safeResponse = { message: 'If an account exists for that email, a password reset link will be sent shortly.' };
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!validator.isEmail(email)) return res.json(safeResponse);
    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!user) return res.json(safeResponse);
    const { rawToken, tokenHash } = createResetToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetBase = process.env.FRONTEND_RESET_URL || 'http://127.0.0.1:5500/reset-password.html';
    const resetUrl = `${resetBase}?token=${encodeURIComponent(rawToken)}`;
    try { await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl }); }
    catch (emailError) { console.error('[Email] Password reset email failed:', emailError.message); if (process.env.NODE_ENV !== 'test') return res.json(safeResponse); }
    if (process.env.NODE_ENV === 'test') return res.json({ ...safeResponse, resetToken: rawToken });
    return res.json(safeResponse);
  } catch (error) { return next(error); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body || {};
    if (!token || !validatePassword(password) || password !== confirmPassword) return res.status(400).json({ message: 'A valid token and matching password are required' });
    const tokenHash = hashResetToken(token);
    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.tokenVersion += 1;
    await user.save();
    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) { return next(error); }
}

async function logout(req, res, next) {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();
    return res.json({ message: 'Logged out successfully' });
  } catch (error) { return next(error); }
}

module.exports = { register, login, me, logout, forgotPassword, resetPassword };
