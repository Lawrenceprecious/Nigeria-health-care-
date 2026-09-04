const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDatabase, disconnectDatabase } = require('../config/db');
const { createApp } = require('../app');
const User = require('../models/User');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FRONTEND_RESET_URL = 'http://127.0.0.1:5500/reset-password.html';

let mongo;
let app;

describe('HealthConnect authentication flow', () => {
  beforeAll(async () => { mongo = await MongoMemoryServer.create(); await connectDatabase(mongo.getUri()); app = createApp(); });
  beforeEach(async () => { await User.deleteMany({}); });
  afterAll(async () => { await disconnectDatabase(); if (mongo) await mongo.stop(); });

  it('registers, logs in, reads the protected profile, and logs out', async () => {
    const registration = await request(app).post('/api/auth/register').send({ name: 'Ada Health', email: 'ada@example.com', password: 'securepass1', confirmPassword: 'securepass1' });
    expect(registration.status).toBe(201);
    expect(registration.body.token).toBeTruthy();
    const token = registration.body.token;
    const profile = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.user.email).toBe('ada@example.com');
    const logout = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(logout.status).toBe(200);
    const rejected = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(rejected.status).toBe(401);
  });

  it('returns the same forgot-password response for unknown and known emails', async () => {
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'unknown@example.com' });
    await request(app).post('/api/auth/register').send({ name: 'Ada Health', email: 'ada@example.com', password: 'securepass1', confirmPassword: 'securepass1' });
    const known = await request(app).post('/api/auth/forgot-password').send({ email: 'ada@example.com' });
    expect(unknown.status).toBe(200);
    expect(known.status).toBe(200);
    expect(unknown.body.message).toBe(known.body.message);
    expect(known.body.resetToken).toBeTruthy();
  });

  it('resets a password once, then rejects reuse of the same token', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Ada Health', email: 'ada@example.com', password: 'securepass1', confirmPassword: 'securepass1' });
    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: 'ada@example.com' });
    const reset = await request(app).post('/api/auth/reset-password').send({ token: forgot.body.resetToken, password: 'newsecure2', confirmPassword: 'newsecure2' });
    expect(reset.status).toBe(200);
    const login = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'newsecure2' });
    expect(login.status).toBe(200);
    const reused = await request(app).post('/api/auth/reset-password').send({ token: forgot.body.resetToken, password: 'anothersecure3', confirmPassword: 'anothersecure3' });
    expect(reused.status).toBe(400);
  });

  it('rejects an expired reset token', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Ada Health', email: 'ada@example.com', password: 'securepass1', confirmPassword: 'securepass1' });
    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: 'ada@example.com' });
    await User.updateOne({ email: 'ada@example.com' }, { passwordResetExpiresAt: new Date(Date.now() - 1000) });
    const reset = await request(app).post('/api/auth/reset-password').send({ token: forgot.body.resetToken, password: 'newsecure2', confirmPassword: 'newsecure2' });
    expect(reset.status).toBe(400);
  });
});
