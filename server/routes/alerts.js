// ============================================================
// FlightZone AI — Alerts Routes
// Task 3.8 — routes/alerts.js
// GET  /api/alerts
// PATCH /api/alerts/:id/read
// GET  /api/system/alerts
// ============================================================
const router = require('express').Router();
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * GET /api/alerts
 * Returns all flight alerts ordered by created_at DESC.
 * Optional ?unread=true to filter only unread.
 */
router.get('/', async (req, res, next) => {
  try {
    const { unread } = req.query;
    let query = `
      SELECT id, severity, message, flight_id, is_read, created_at
      FROM alerts
    `;
    if (unread === 'true') {
      query += ' WHERE is_read = FALSE';
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/alerts/:id/read
 * Marks an alert as read (is_read = true).
 */
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE alerts SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Alert ${id} not found` });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/system/alerts
 * Returns system-level connectivity and optimization error alerts.
 * These are generated dynamically, not stored in the alerts table.
 */
router.get('/system', async (req, res, next) => {
  try {
    // Check DB connectivity as a real system health indicator
    const systemAlerts = [];

    try {
      await pool.query('SELECT 1');
    } catch {
      systemAlerts.push({
        type: 'error',
        message: 'Database connectivity issue detected',
        ts: new Date().toISOString(),
      });
    }

    // Check if any aviation service errors were recently logged
    // (placeholder — extend with real error log table if needed)
    if (!process.env.AVIATIONSTACK_KEY || process.env.AVIATIONSTACK_KEY === 'YOUR_AVIATIONSTACK_API_KEY_HERE') {
      systemAlerts.push({
        type: 'warning',
        message: 'Aviationstack API key not configured — using seeded demo data',
        ts: new Date().toISOString(),
      });
    }

    if (!process.env.OPENWEATHERMAP_KEY || process.env.OPENWEATHERMAP_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
      systemAlerts.push({
        type: 'warning',
        message: 'OpenWeatherMap API key not configured — using cached risk values',
        ts: new Date().toISOString(),
      });
    }

    if (systemAlerts.length === 0) {
      systemAlerts.push({
        type: 'success',
        message: 'All systems operational',
        ts: new Date().toISOString(),
      });
    }

    res.json(systemAlerts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
