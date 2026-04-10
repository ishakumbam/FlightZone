// ============================================================
// FlightZone AI — Aviationstack Integration
// Task 3.10 — services/aviationService.js
//
// HOW TO ACTIVATE:
//   1. Sign up at https://aviationstack.com/signup/free
//   2. Copy your API key to .env → AVIATIONSTACK_KEY=your_key
//   3. Restart the server — polling will start automatically.
// ============================================================
const fetch = require('node-fetch');
const cron = require('node-cron');
const { pool } = require('../database/db');

const API_BASE = 'http://api.aviationstack.com/v1';

// Key AA routes to poll on free tier (minimize API calls)
const TRACKED_ROUTES = [
  { dep_iata: 'DFW', arr_iata: 'LAX' },
  { dep_iata: 'JFK', arr_iata: 'MIA' },
  { dep_iata: 'ORD', arr_iata: 'DFW' },
];

/**
 * Map Aviationstack flight status to our schema status values.
 */
function mapStatus(asStatus) {
  const map = {
    scheduled: 'on-time',
    active: 'in-air',
    landed: 'on-time',
    cancelled: 'cancelled',
    incident: 'delayed',
    diverted: 'delayed',
  };
  return map[asStatus] || 'on-time';
}

/**
 * Fetch flights for a single route from Aviationstack.
 * Free tier: 500 req/month — we poll 3 routes every 5 min = ~432/day max.
 * Reduce TRACKED_ROUTES if near limit.
 */
async function fetchRouteFlights({ dep_iata, arr_iata }) {
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key || key === 'YOUR_AVIATIONSTACK_API_KEY_HERE') return [];

  try {
    const url = `${API_BASE}/flights?access_key=${key}&dep_iata=${dep_iata}&arr_iata=${arr_iata}&airline_iata=AA&limit=5`;
    const response = await fetch(url, { timeout: 8000 });

    if (!response.ok) {
      console.error(`[AVIATION] HTTP ${response.status} for ${dep_iata}→${arr_iata}`);
      return [];
    }

    const data = await response.json();
    if (data.error) {
      console.error('[AVIATION] API error:', data.error.message);
      return [];
    }

    return (data.data || []).map((f) => ({
      flight_id:   f.flight?.iata || `${dep_iata}${arr_iata}${Date.now()}`,
      origin:      f.departure?.iata || dep_iata,
      dest:        f.arrival?.iata || arr_iata,
      route:       `${f.departure?.iata || dep_iata} → ${f.arrival?.iata || arr_iata}`,
      status:      mapStatus(f.flight_status),
      weather:     'Clear',   // weather enrichment done by weatherService
      fuel_pred:   null,      // fuel prediction done by optimize engine
      origin_lat:  null,      // lat/lng not available from Aviationstack basic tier
      origin_lng:  null,
      dest_lat:    null,
      dest_lng:    null,
      departure:   f.departure?.estimated || null,
      arrival:     f.arrival?.estimated || null,
      aircraft:    f.aircraft?.iata || null,
    }));
  } catch (err) {
    console.error(`[AVIATION] Fetch failed for ${dep_iata}→${arr_iata}:`, err.message);
    return [];
  }
}

/**
 * Upsert a flight into the DB.
 * If flight_id already exists, only update status and updated_at.
 */
async function upsertFlight(flight) {
  await pool.query(
    `INSERT INTO flights
       (flight_id, origin, dest, route, status, weather, fuel_pred,
        origin_lat, origin_lng, dest_lat, dest_lng, departure, arrival, aircraft, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
     ON CONFLICT (flight_id) DO UPDATE SET
       status = EXCLUDED.status,
       updated_at = NOW()`,
    [
      flight.flight_id, flight.origin, flight.dest, flight.route,
      flight.status, flight.weather, flight.fuel_pred,
      flight.origin_lat, flight.origin_lng,
      flight.dest_lat, flight.dest_lng,
      flight.departure, flight.arrival, flight.aircraft,
    ]
  );
}

/**
 * Run one polling cycle across all tracked routes.
 */
async function pollOnce() {
  console.log('[AVIATION] Polling Aviationstack...');
  let total = 0;
  for (const route of TRACKED_ROUTES) {
    const flights = await fetchRouteFlights(route);
    for (const f of flights) {
      await upsertFlight(f);
      total++;
    }
  }
  console.log(`[AVIATION] Upserted ${total} flights from live API`);
}

/**
 * Start cron job — every 5 minutes.
 * Called from server.js after DB is ready and API key is configured.
 */
function startAviationPolling() {
  // Run immediately on startup
  pollOnce().catch((err) => console.error('[AVIATION] Initial poll failed:', err.message));

  // Then every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    pollOnce().catch((err) => console.error('[AVIATION] Poll failed:', err.message));
  });
}

module.exports = { startAviationPolling, fetchRouteFlights, pollOnce };
