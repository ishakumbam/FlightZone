// ============================================================
// FlightZone AI — OpenWeatherMap Integration
// Task 3.11 — services/weatherService.js
//
// HOW TO ACTIVATE:
//   1. Sign up at https://home.openweathermap.org/users/sign_up
//   2. Go to API Keys tab → copy your key (wait ~10 min for activation)
//   3. Add to .env → OPENWEATHERMAP_KEY=your_key
// ============================================================
const fetch = require('node-fetch');
const { pool } = require('../database/db');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ICAO → approximate coords lookup (used when live API is not available)
// Extends gracefully — add more airports as needed
const AIRPORT_COORDS = {
  DFW: { lat: 32.8998, lon: -97.0403 },
  LAX: { lat: 33.9425, lon: -118.4081 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  MIA: { lat: 25.7959, lon: -80.2870 },
  ORD: { lat: 41.9742, lon: -87.9073 },
  SFO: { lat: 37.6213, lon: -122.3790 },
  SEA: { lat: 47.4502, lon: -122.3088 },
};

// Static fallback risk table (used when API key not configured)
const STATIC_RISK = {
  DFW: { risk: 0.3, level: 'Low',    weather: 'Clear'  },
  LAX: { risk: 0.2, level: 'Low',    weather: 'Clear'  },
  JFK: { risk: 0.5, level: 'Medium', weather: 'Partly Cloudy' },
  MIA: { risk: 0.7, level: 'High',   weather: 'Stormy' },
  ORD: { risk: 0.55, level:'Medium', weather: 'Foggy'  },
  SFO: { risk: 0.4,  level:'Medium', weather: 'Foggy'  },
  SEA: { risk: 0.35, level:'Low',    weather: 'Rainy'  },
};

/**
 * Map OpenWeatherMap condition codes to a risk score (0.0 – 1.0)
 * and risk level label.
 */
function owmToRisk(weatherId, windSpeed) {
  // Thunderstorm (2xx)
  if (weatherId >= 200 && weatherId < 300) return { risk: 0.9, level: 'High', weather: 'Stormy' };
  // Drizzle (3xx)
  if (weatherId >= 300 && weatherId < 400) return { risk: 0.3, level: 'Low', weather: 'Drizzle' };
  // Rain (5xx)
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId >= 502) return { risk: 0.75, level: 'High', weather: 'Heavy Rain' };
    return { risk: 0.5, level: 'Medium', weather: 'Rain' };
  }
  // Snow (6xx)
  if (weatherId >= 600 && weatherId < 700) return { risk: 0.7, level: 'High', weather: 'Snowy' };
  // Atmosphere (7xx) — fog, mist, smoke
  if (weatherId === 741 || weatherId === 701) return { risk: 0.6, level: 'Medium', weather: 'Foggy' };
  if (weatherId >= 700 && weatherId < 800) return { risk: 0.45, level: 'Medium', weather: 'Hazy' };
  // Clear (800)
  if (weatherId === 800) {
    const windPenalty = windSpeed > 20 ? 0.2 : 0;
    return { risk: 0.1 + windPenalty, level: windPenalty ? 'Medium' : 'Low', weather: 'Clear' };
  }
  // Clouds (80x)
  if (weatherId > 800) return { risk: 0.2, level: 'Low', weather: 'Partly Cloudy' };
  return { risk: 0.3, level: 'Low', weather: 'Clear' };
}

/**
 * Fetch weather for an airport code. Checks DB cache first (30 min TTL).
 * Falls back to static lookup if API key not configured or request fails.
 *
 * @param {string} airport — IATA/ICAO code e.g. 'DFW'
 * @returns {number} risk score 0.0–1.0
 */
async function getWeatherRisk(airport) {
  const code = airport?.toUpperCase();
  if (!code) return 0.3;

  // 1 — Check DB cache
  try {
    const cached = await pool.query(
      `SELECT data, risk_level, fetched_at FROM weather_cache WHERE airport = $1`,
      [code]
    );
    if (cached.rows.length > 0) {
      const { fetched_at, data, risk_level } = cached.rows[0];
      const age = Date.now() - new Date(fetched_at).getTime();
      if (age < CACHE_TTL_MS) {
        return data.riskScore ?? 0.3;
      }
    }
  } catch (err) {
    console.error('[WEATHER] Cache read failed:', err.message);
  }

  // 2 — Try live API
  const key = process.env.OPENWEATHERMAP_KEY;
  if (key && key !== 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    const coords = AIRPORT_COORDS[code];
    if (coords) {
      try {
        const url = `${OWM_BASE}?lat=${coords.lat}&lon=${coords.lon}&appid=${key}&units=metric`;
        const resp = await fetch(url, { timeout: 5000 });
        if (resp.ok) {
          const json = await resp.json();
          const weatherId = json.weather?.[0]?.id || 800;
          const windSpeed = json.wind?.speed || 0;
          const { risk, level, weather } = owmToRisk(weatherId, windSpeed);

          // Upsert cache
          await pool.query(
            `INSERT INTO weather_cache (airport, data, risk_level, fetched_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (airport) DO UPDATE SET data=$2, risk_level=$3, fetched_at=NOW()`,
            [code, JSON.stringify({ riskScore: risk, weather, raw: json }), level]
          );

          return risk;
        }
      } catch (err) {
        console.error(`[WEATHER] Live fetch failed for ${code}:`, err.message);
      }
    }
  }

  // 3 — Static fallback
  const fallback = STATIC_RISK[code];
  if (fallback) {
    console.log(`[WEATHER] Using static fallback for ${code}: risk=${fallback.risk}`);
    return fallback.risk;
  }

  return 0.3; // default medium-low
}

/**
 * Get full weather info (risk + label + description) for a route.
 * Used by RouteRecommendations page.
 */
async function getWeatherInfo(airport) {
  const code = airport?.toUpperCase();
  const risk = await getWeatherRisk(code);

  // Try to get the cached label
  try {
    const cached = await pool.query(
      'SELECT data, risk_level FROM weather_cache WHERE airport = $1',
      [code]
    );
    if (cached.rows.length > 0) {
      const { data, risk_level } = cached.rows[0];
      return {
        airport: code,
        riskScore: risk,
        riskLevel: risk_level,
        weather: data.weather || 'Unknown',
      };
    }
  } catch (_) {}

  const fallback = STATIC_RISK[code] || { risk, level: 'Low', weather: 'Clear' };
  return {
    airport: code,
    riskScore: risk,
    riskLevel: fallback.level,
    weather: fallback.weather,
  };
}

module.exports = { getWeatherRisk, getWeatherInfo };
