-- ============================================================
-- FlightZone AI — Database Schema
-- Task 3.3 — database/schema.sql
-- Run: psql $DATABASE_URL -f database/schema.sql
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  employee_id   VARCHAR(20)  UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'dispatcher', 'pilot')),
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Flights ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flights (
  id          SERIAL PRIMARY KEY,
  flight_id   VARCHAR(20)  UNIQUE NOT NULL,
  origin      VARCHAR(10)  NOT NULL,
  dest        VARCHAR(10)  NOT NULL,
  route       VARCHAR(50)  NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'on-time' CHECK (status IN ('on-time', 'delayed', 'cancelled', 'in-air')),
  weather     VARCHAR(30)  NOT NULL DEFAULT 'Clear',
  fuel_pred   NUMERIC(10,2),
  origin_lat  NUMERIC(9,6),
  origin_lng  NUMERIC(9,6),
  dest_lat    NUMERIC(9,6),
  dest_lng    NUMERIC(9,6),
  departure   TIMESTAMPTZ,
  arrival     TIMESTAMPTZ,
  aircraft    VARCHAR(20),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Route Logs (Optimization history) ─────────────────────
CREATE TABLE IF NOT EXISTS route_logs (
  id             SERIAL PRIMARY KEY,
  flight_id      VARCHAR(20)  NOT NULL,
  selected_route VARCHAR(20),          -- 'A' | 'B' | 'C' | null (not yet selected)
  route_label    VARCHAR(30),          -- 'Aggressive' | 'Balanced' | 'Conservative'
  fuel_burn      NUMERIC(10,2),
  risk_score     NUMERIC(5,2),
  delay_minutes  INTEGER,
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  timeframe      VARCHAR(30),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Alerts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id          SERIAL PRIMARY KEY,
  severity    VARCHAR(10)  NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  message     TEXT         NOT NULL,
  flight_id   VARCHAR(20),
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Weather Cache ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_cache (
  id          SERIAL PRIMARY KEY,
  airport     VARCHAR(10)  UNIQUE NOT NULL,
  data        JSONB        NOT NULL,
  risk_level  VARCHAR(10)  NOT NULL DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Medium', 'High')),
  fetched_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Contact Form Log ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  message     TEXT         NOT NULL,
  sent        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_flights_status   ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_flight_id ON flights(flight_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity  ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read   ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_route_logs_created ON route_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_airport  ON weather_cache(airport);
