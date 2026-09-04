require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const healthcareRoutes = require('./routes/healthcare');
const adminRoutes = require('./routes/admin');

function createApp() {
  const app = express();
  const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
  app.use(helmet());
  app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(express.json({ limit: '50kb' }));
  app.use(morgan('tiny'));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'healthconnect-nigeria-backend' }));
  app.use('/api/auth', authRoutes);
  app.use('/api', healthcareRoutes);
  app.use('/api/admin', adminRoutes);
  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use((error, req, res, next) => {
    console.error('[API]', error);
    if (res.headersSent) return next(error);
    const duplicate = error?.code === 11000;
    if (duplicate) return res.status(409).json({ message: 'A record with that value already exists' });
    return res.status(error.statusCode || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Unexpected server error' : error.message || 'Unexpected server error' });
  });
  return app;
}

module.exports = { createApp };
