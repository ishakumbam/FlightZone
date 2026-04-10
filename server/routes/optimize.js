// ============================================================
// FlightZone AI — Route Optimization Engine
// Tasks 3.12, 3.13 — routes/optimize.js
// POST /api/optimize
// GET  /api/routes/logs
// ============================================================
const router = require('express').Router();
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getWeatherRisk } = require('../services/weatherService');

router.use(authMiddleware);

// ── Scoring Constants ──────────────────────────────────────
const WEIGHTS = { weatherRisk: 0.4, congestion: 0.3, fuelCost: 0.3 };

// Congestion lookup by airport (0.0 – 1.0 scale)
const CONGESTION_MAP = {
  ORD: 0.9, JFK: 0.85, LAX: 0.8, DFW: 0.75,
  SFO: 0.65, MIA: 0.6,  SEA: 0.45,
};

function getCongestion(airport) {
  return CONGESTION_MAP[airport?.toUpperCase()] ?? 0.5;
}

/**
 * Normalize a value between 0 and 1.
 * max defaults to the given value if min === max (avoid div by 0).
 */
function normalize(val, min, max) {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (val - min) / (max - min)));
}

/**
 * Generate 3 route variations from base flight data.
 * aggressive  — lowest fuel, higher risk, potential delay
 * balanced    — moderate on all axes (default recommendation)
 * conservative — highest safety margin, more fuel, no delay
 */
function generateRouteVariations(flight, weatherRisk) {
  const baseFuel = parseFloat(flight.fuel_pred) || 15000;
  const congestion = getCongestion(flight.dest);

  // Base risk score (0–1)
  const baseRiskNorm = weatherRisk;
  const congestionNorm = congestion;
  const fuelNorm = normalize(baseFuel, 4000, 25000);

  const baseScore =
    WEIGHTS.weatherRisk * baseRiskNorm +
    WEIGHTS.congestion * congestionNorm +
    WEIGHTS.fuelCost * fuelNorm;

  const routes = [
    {
      routeId: 'A',
      label: 'Aggressive',
      strategy: 'Shortest path — direct routing, minimal altitude changes.',
      fuelBurn: Math.round(baseFuel * 0.88),               // 12% fuel saving
      riskScore: +(baseScore * 1.35).toFixed(2),            // higher risk
      passengerImpact: 'Minor turbulence possible',
      delayMinutes: Math.max(0, Math.round((congestion - 0.5) * 30)),
      estimatedTime: calcFlightTime(flight, 0.88),
      savings: '+12% fuel efficiency',
    },
    {
      routeId: 'B',
      label: 'Balanced',
      strategy: 'Optimal balance of fuel efficiency, safety, and schedule.',
      fuelBurn: Math.round(baseFuel * 1.0),                 // baseline
      riskScore: +(baseScore * 1.0).toFixed(2),
      passengerImpact: 'Smooth ride expected',
      delayMinutes: Math.max(0, Math.round((congestion - 0.3) * 15)),
      estimatedTime: calcFlightTime(flight, 1.0),
      savings: 'Recommended',
    },
    {
      routeId: 'C',
      label: 'Conservative',
      strategy: 'Weather-avoidance routing. Longer path, maximum safety margin.',
      fuelBurn: Math.round(baseFuel * 1.14),                // 14% more fuel
      riskScore: +(baseScore * 0.55).toFixed(2),            // lowest risk
      passengerImpact: 'Maximum comfort, weather avoided',
      delayMinutes: Math.round(congestion * 8),             // small delay
      estimatedTime: calcFlightTime(flight, 1.14),
      savings: 'Lowest risk score',
    },
  ];

  return routes;
}

function calcFlightTime(flight, factor) {
  const dist = haversineKm(
    flight.origin_lat, flight.origin_lng,
    flight.dest_lat,   flight.dest_lng
  );
  const hours = (dist / 850) * factor; // ~850 km/h cruising speed
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── POST /api/optimize ────────────────────────────────────
/**
 * Task 3.12
 * Body: { flightId, timeframe }
 * Returns: { flight, routes: [A, B, C], logId }
 * Must respond in < 6 seconds (NF5).
 */
router.post('/optimize', async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { flightId, timeframe } = req.body;

    if (!flightId) {
      return res.status(400).json({ error: 'flightId is required' });
    }

    // 1 — Fetch flight
    const flightResult = await pool.query(
      'SELECT * FROM flights WHERE flight_id = $1',
      [flightId.toUpperCase()]
    );
    if (flightResult.rows.length === 0) {
      return res.status(404).json({ error: `Flight ${flightId} not found` });
    }
    const flight = flightResult.rows[0];

    // 2 — Get weather risk (parallel for origin + dest)
    const [originRisk, destRisk] = await Promise.all([
      getWeatherRisk(flight.origin),
      getWeatherRisk(flight.dest),
    ]);
    // Use worst-case weather risk (0.0–1.0)
    const weatherRisk = Math.max(originRisk, destRisk);

    // 3 — Generate 3 route options
    const routes = generateRouteVariations(flight, weatherRisk);

    // 4 — Log this optimization run
    const logResult = await pool.query(
      `INSERT INTO route_logs (flight_id, status, timeframe)
       VALUES ($1, 'pending', $2)
       RETURNING id`,
      [flight.flight_id, timeframe || 'today']
    );
    const logId = logResult.rows[0].id;

    const elapsed = Date.now() - startTime;
    console.log(`[OPTIMIZE] ${flightId} — computed in ${elapsed}ms`);

    res.json({ flight, routes, logId, computedInMs: elapsed });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/optimize/select ────────────────────────────
/**
 * Called when the user clicks "SELECT ROUTE" on the frontend.
 * Body: { logId, routeId, label, fuelBurn, riskScore, delayMinutes }
 * Updates the route_logs entry to 'completed' with the chosen route.
 */
router.patch('/optimize/select', async (req, res, next) => {
  try {
    const { logId, routeId, label, fuelBurn, riskScore, delayMinutes } = req.body;

    if (!logId || !routeId) {
      return res.status(400).json({ error: 'logId and routeId are required' });
    }

    const result = await pool.query(
      `UPDATE route_logs
       SET selected_route = $1, route_label = $2, fuel_burn = $3,
           risk_score = $4, delay_minutes = $5, status = 'completed'
       WHERE id = $6
       RETURNING *`,
      [routeId, label, fuelBurn, riskScore, delayMinutes, logId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Log ${logId} not found` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/routes/logs ──────────────────────────────────
/**
 * Task 3.13
 * Returns optimization logs joined with flights, ordered newest first.
 */
router.get('/routes/logs', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        rl.id, rl.flight_id, rl.selected_route, rl.route_label,
        rl.fuel_burn, rl.risk_score, rl.delay_minutes,
        rl.status, rl.timeframe, rl.created_at,
        f.route, f.origin, f.dest, f.aircraft
      FROM route_logs rl
      LEFT JOIN flights f ON f.flight_id = rl.flight_id
      ORDER BY rl.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
