// ============================================================
// FlightZone AI — Express Server Entry Point
// Task 3.2 — server/server.js
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database/db');

// Route imports
const authRoutes = require('./routes/auth');
const flightsRoutes = require('./routes/flights');
const alertsRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');
const optimizeRoutes = require('./routes/optimize');
const contactRoutes = require('./routes/contact');

// Scheduled services (start polling after DB is ready)
const { startAviationPolling } = require('./services/aviationService');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'FlightZone AI API' });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', optimizeRoutes);       // /api/optimize  + /api/routes/logs
app.use('/api/contact', contactRoutes);

// ── 404 Handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message, err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Bootstrap ──────────────────────────────────────────────
async function bootstrap() {
  try {
    await initDB();
    console.log('[DB] Connected to PostgreSQL ✓');

    app.listen(PORT, () => {
      console.log(`[SERVER] FlightZone AI running on http://localhost:${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Start Aviationstack polling every 5 minutes
    if (process.env.AVIATIONSTACK_KEY && process.env.AVIATIONSTACK_KEY !== 'YOUR_AVIATIONSTACK_API_KEY_HERE') {
      startAviationPolling();
      console.log('[AVIATION] Live flight polling started (every 5 min)');
    } else {
      console.log('[AVIATION] Skipping live polling — no API key configured. Using seeded data.');
    }
  } catch (err) {
    console.error('[FATAL] Could not start server:', err.message);
    process.exit(1);
  }
}

bootstrap();
