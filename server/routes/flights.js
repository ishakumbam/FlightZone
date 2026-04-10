// ============================================================
// FlightZone AI — Flights Routes
// Task 3.7 — routes/flights.js
// GET /api/flights
// ============================================================
const router = require('express').Router();
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

// All flight routes require authentication
router.use(authMiddleware);

/**
 * GET /api/flights
 * Query params:
 *   ?status=on-time|delayed|cancelled|in-air
 *   ?search=<string>  (matches flight_id or route)
 *   ?date=today|week  (filters by departure window)
 * Returns array of flight objects including all map fields.
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, search, date } = req.query;

    let query = `
      SELECT
        id, flight_id, origin, dest, route, status,
        weather, fuel_pred, origin_lat, origin_lng,
        dest_lat, dest_lng, departure, arrival, aircraft, updated_at
      FROM flights
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Filter by status
    if (status && status !== 'all') {
      query += ` AND status = $${idx++}`;
      params.push(status);
    }

    // Filter by search (flight_id or route)
    if (search && search.trim()) {
      query += ` AND (LOWER(flight_id) LIKE $${idx} OR LOWER(route) LIKE $${idx})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      idx++;
    }

    // Filter by date
    if (date === 'today') {
      query += ` AND departure::date = CURRENT_DATE`;
    } else if (date === 'week') {
      query += ` AND departure >= NOW() - INTERVAL '7 days'`;
    }

    query += ' ORDER BY departure ASC NULLS LAST';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/flights/:flightId
 * Returns a single flight by flight_id (e.g. 'AA100').
 */
router.get('/:flightId', async (req, res, next) => {
  try {
    const { flightId } = req.params;
    const result = await pool.query(
      'SELECT * FROM flights WHERE flight_id = $1',
      [flightId.toUpperCase()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Flight ${flightId} not found` });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
