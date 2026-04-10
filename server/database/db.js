// ============================================================
// FlightZone AI — PostgreSQL Connection Pool
// database/db.js
// ============================================================
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Run schema.sql to ensure tables exist on startup.
 * Safe to call multiple times — uses CREATE TABLE IF NOT EXISTS.
 */
async function initDB() {
  const fs = require('fs');
  const path = require('path');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
}

module.exports = { pool, initDB };
