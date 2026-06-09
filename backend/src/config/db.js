const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('connect', async (client) => {
  try { await client.query('SET statement_timeout = 10000'); } catch (e) { console.error('Failed to set statement_timeout:', e.message); }
});

pool.on('error', (err) => { console.error('DB pool error:', err); process.exit(-1); });

module.exports = pool;