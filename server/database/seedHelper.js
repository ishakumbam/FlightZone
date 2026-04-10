// ============================================================
// FlightZone AI — Seed Helper
// database/seedHelper.js
//
// Run this ONCE to:
//  1. Create all tables (schema.sql)
//  2. Seed users with REAL bcrypt-hashed passwords
//  3. Seed flights + alerts
//
// Usage:
//   cd server
//   node database/seedHelper.js
// ============================================================
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const CREDENTIALS = [
  { employeeId: 'EMP001', name: 'Alex Johnson',   role: 'admin',      email: 'alex.johnson@americanairlines.com',   password: 'Admin@1234'    },
  { employeeId: 'EMP002', name: 'Maria Garcia',   role: 'dispatcher', email: 'maria.garcia@americanairlines.com',   password: 'Dispatch@1234' },
  { employeeId: 'EMP003', name: 'James Williams', role: 'pilot',      email: 'james.williams@americanairlines.com', password: 'Pilot@1234'    },
];

async function run() {
  console.log('[SEED] Connecting to PostgreSQL...');

  // 1 — Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('[SEED] Schema applied ✓');

  // 2 — Upsert users with fresh bcrypt hashes
  for (const u of CREDENTIALS) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (employee_id, name, role, email, password_hash, status)
       VALUES ($1,$2,$3,$4,$5,'active')
       ON CONFLICT (employee_id) DO UPDATE SET password_hash=$5`,
      [u.employeeId, u.name, u.role, u.email, hash]
    );
    console.log(`[SEED] User ${u.employeeId} (${u.role}) seeded ✓`);
  }

  // 3 — Seed flights
  const flights = [
    ['AA100','DFW','LAX','DFW → LAX','on-time','Clear',   18500.00, 32.8998, -97.0403, 33.9425,-118.4081,'B737'],
    ['AA200','JFK','MIA','JFK → MIA','delayed','Stormy',  12300.50, 40.6413, -73.7781, 25.7959, -80.2870,'A321'],
    ['AA300','ORD','DFW','ORD → DFW','on-time','Clear',   10800.75, 41.9742, -87.9073, 32.8998, -97.0403,'B737'],
    ['AA400','LAX','SFO','LAX → SFO','on-time','Foggy',    4200.00, 33.9425,-118.4081, 37.6213,-122.3790,'A319'],
    ['AA500','DFW','JFK','DFW → JFK','on-time','Clear',   16900.25, 32.8998, -97.0403, 40.6413, -73.7781,'B777'],
    ['AA600','MIA','ORD','MIA → ORD','cancelled','Stormy',14100.00, 25.7959, -80.2870, 41.9742, -87.9073,'B737'],
    ['AA700','SFO','SEA','SFO → SEA','on-time','Foggy',    6800.50, 37.6213,-122.3790, 47.4502,-122.3088,'A320'],
    ['AA800','DFW','MIA','DFW → MIA','delayed','Clear',   11200.00, 32.8998, -97.0403, 25.7959, -80.2870,'A321'],
    ['AA900','JFK','LAX','JFK → LAX','in-air','Clear',    22000.00, 40.6413, -73.7781, 33.9425,-118.4081,'B787'],
    ['AA1000','ORD','SFO','ORD → SFO','on-time','Clear',  19500.50, 41.9742, -87.9073, 37.6213,-122.3790,'B737'],
    ['AA1100','SEA','LAX','SEA → LAX','on-time','Clear',   9800.25, 47.4502,-122.3088, 33.9425,-118.4081,'A320'],
    ['AA1200','MIA','JFK','MIA → JFK','delayed','Stormy', 13200.75, 25.7959, -80.2870, 40.6413, -73.7781,'A321'],
    ['AA1300','DFW','ORD','DFW → ORD','on-time','Clear',  10600.00, 32.8998, -97.0403, 41.9742, -87.9073,'B737'],
    ['AA1400','LAX','JFK','LAX → JFK','in-air','Clear',   21800.50, 33.9425,-118.4081, 40.6413, -73.7781,'B777'],
    ['AA1500','SFO','DFW','SFO → DFW','on-time','Foggy',  17100.00, 37.6213,-122.3790, 32.8998, -97.0403,'B787'],
  ];

  for (const f of flights) {
    await pool.query(
      `INSERT INTO flights
         (flight_id,origin,dest,route,status,weather,fuel_pred,origin_lat,origin_lng,dest_lat,dest_lng,aircraft)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (flight_id) DO NOTHING`,
      f
    );
  }
  console.log(`[SEED] ${flights.length} flights seeded ✓`);

  // 4 — Seed alerts
  const alerts = [
    ['HIGH',   'Severe turbulence on JFK → MIA corridor. Consider routing via Norfolk VOR.', 'AA200',  false],
    ['HIGH',   'Flight AA600 cancelled — Hurricane winds in Miami. Rebook 147 passengers.',  'AA600',  false],
    ['MEDIUM', 'Fog advisory at SFO — visibility below 600m. Expect 20–30 min delays.',      'AA400',  false],
    ['MEDIUM', 'Thunderstorm along MIA → JFK at FL330. Weather avoidance recommended.',      'AA1200', false],
    ['LOW',    'ATC congestion at ORD — AA300 may see 8-min hold before pushback.',          'AA300',  true ],
  ];

  for (const a of alerts) {
    await pool.query(
      `INSERT INTO alerts (severity, message, flight_id, is_read)
       VALUES ($1,$2,$3,$4)`,
      a
    );
  }
  console.log(`[SEED] ${alerts.length} alerts seeded ✓`);

  console.log('\n[SEED] ══════════════════════════════════════════');
  console.log('[SEED] All done! Share these credentials at Sync 1:');
  for (const u of CREDENTIALS) {
    console.log(`[SEED]   ${u.role.padEnd(12)} → ID: ${u.employeeId}  PW: ${u.password}`);
  }
  console.log('[SEED] ══════════════════════════════════════════\n');
  await pool.end();
}

run().catch((err) => { console.error('[SEED ERROR]', err.message); process.exit(1); });
