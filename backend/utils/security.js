const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return process.env.JWT_SECRET;
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone || '', role: user.role };
}

module.exports = { signToken, verifyToken, sanitizeUser };
