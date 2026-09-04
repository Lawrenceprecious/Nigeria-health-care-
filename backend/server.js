require('dotenv').config();
const { createApp } = require('./app');
const { connectDatabase } = require('./config/db');

const port = Number(process.env.PORT || 5000);

async function start() {
  await connectDatabase();
  const app = createApp();
  app.listen(port, () => console.log(`HealthConnect API listening on port ${port}`));
}

if (require.main === module) start().catch((error) => { console.error('[Startup] Unable to start server:', error); process.exit(1); });

module.exports = { start };
