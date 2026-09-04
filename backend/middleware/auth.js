const User = require('../models/User');
const { verifyToken } = require('../utils/security');

async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const payload = verifyToken(header.slice(7));
    const user = await User.findById(payload.sub).select('+password');
    if (!user || user.tokenVersion !== payload.tokenVersion) return res.status(401).json({ message: 'Session expired or invalid' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' });
  next();
}

module.exports = { requireAuth, requireAdmin };
