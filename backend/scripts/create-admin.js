require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('../config/db');
const User = require('../models/User');

async function run() {
  if (!process.env.ADMIN_SETUP_KEY || process.env.ADMIN_SETUP_KEY === 'replace_with_a_separate_one_time_setup_key') throw new Error('Set a private ADMIN_SETUP_KEY before running this script');
  if (process.env.PROVISION_ADMIN_KEY !== process.env.ADMIN_SETUP_KEY) throw new Error('Set PROVISION_ADMIN_KEY to the exact ADMIN_SETUP_KEY for this one-time operation');
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD for this one-time operation');
  await connectDatabase();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) { existing.role = 'admin'; await existing.save(); console.log(`Promoted ${email} to admin.`); }
  else { await User.create({ name: ADMIN_NAME.trim(), email, password: ADMIN_PASSWORD, role: 'admin' }); console.log(`Created admin account for ${email}.`); }
  await disconnectDatabase();
}

run().catch(async (error) => { console.error('[Create admin]', error.message); await disconnectDatabase(); process.exit(1); });
