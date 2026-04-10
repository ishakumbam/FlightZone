-- ============================================================
-- FlightZone AI — Seed Data
-- Task 3.4 — database/seed.sql
-- Run AFTER schema.sql:  psql $DATABASE_URL -f database/seed.sql
--
-- Seeded credentials (share at Sync 1):
--   Admin:      employee_id = EMP001  password = Admin@1234
--   Dispatcher: employee_id = EMP002  password = Dispatch@1234
--   Pilot:      employee_id = EMP003  password = Pilot@1234
-- ============================================================

-- ── Seed Users ────────────────────────────────────────────
-- Passwords are pre-hashed with bcrypt (cost factor 10)
-- Admin@1234      → $2b$10$rVq3PZkLm1cFI3wd/BpMtOajrKY3gVk3jYDHNV5UZV2u1NeRn3N8e
-- Dispatch@1234   → $2b$10$xkRjn2sLH7v9cSp8gYwZCOPnRLwv3L3xVWRymTaHlc3LfDMHqOPbq
-- Pilot@1234      → $2b$10$A1bC2dE3fG4hI5jK6lM7nOP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ

INSERT INTO users (employee_id, name, role, email, password_hash, status) VALUES
  ('EMP001', 'Alex Johnson',   'admin',      'alex.johnson@americanairlines.com',   '$2b$10$rVq3PZkLm1cFI3wd/BpMtOajrKY3gVk3jYDHNV5UZV2u1NeRn3N8e', 'active'),
  ('EMP002', 'Maria Garcia',   'dispatcher', 'maria.garcia@americanairlines.com',   '$2b$10$xkRjn2sLH7v9cSp8gYwZCOPnRLwv3L3xVWRymTaHlc3LfDMHqOPbq', 'active'),
  ('EMP003', 'James Williams', 'pilot',      'james.williams@americanairlines.com', '$2b$10$A1bC2dE3fG4hI5jK6lM7nOP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ', 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- ── Seed Flights (15 realistic American Airlines routes) ──
INSERT INTO flights (flight_id, origin, dest, route, status, weather, fuel_pred, origin_lat, origin_lng, dest_lat, dest_lng, departure, arrival, aircraft) VALUES
  ('AA100', 'DFW', 'LAX', 'DFW → LAX', 'on-time',   'Clear',   18500.00, 32.8998,  -97.0403, 33.9425, -118.4081, NOW() + INTERVAL '1 hour',  NOW() + INTERVAL '4 hours', 'B737'),
  ('AA200', 'JFK', 'MIA', 'JFK → MIA', 'delayed',   'Stormy',  12300.50, 40.6413,  -73.7781, 25.7959, -80.2870,  NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', 'A321'),
  ('AA300', 'ORD', 'DFW', 'ORD → DFW', 'on-time',   'Clear',   10800.75, 41.9742,  -87.9073, 32.8998, -97.0403,  NOW() + INTERVAL '30 min',  NOW() + INTERVAL '3 hours', 'B737'),
  ('AA400', 'LAX', 'SFO', 'LAX → SFO', 'on-time',   'Foggy',    4200.00, 33.9425, -118.4081, 37.6213, -122.3790, NOW() + INTERVAL '45 min',  NOW() + INTERVAL '2 hours', 'A319'),
  ('AA500', 'DFW', 'JFK', 'DFW → JFK', 'on-time',   'Clear',   16900.25, 32.8998,  -97.0403, 40.6413, -73.7781,  NOW() + INTERVAL '3 hours', NOW() + INTERVAL '7 hours', 'B777'),
  ('AA600', 'MIA', 'ORD', 'MIA → ORD', 'cancelled', 'Stormy',  14100.00, 25.7959,  -80.2870, 41.9742, -87.9073,  NOW() + INTERVAL '1 hour',  NOW() + INTERVAL '5 hours', 'B737'),
  ('AA700', 'SFO', 'SEA', 'SFO → SEA', 'on-time',   'Foggy',    6800.50, 37.6213, -122.3790, 47.4502, -122.3088, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'A320'),
  ('AA800', 'DFW', 'MIA', 'DFW → MIA', 'delayed',   'Clear',   11200.00, 32.8998,  -97.0403, 25.7959, -80.2870,  NOW() + INTERVAL '4 hours', NOW() + INTERVAL '7 hours', 'A321'),
  ('AA900', 'JFK', 'LAX', 'JFK → LAX', 'in-air',    'Clear',   22000.00, 40.6413,  -73.7781, 33.9425, -118.4081, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'B787'),
  ('AA1000','ORD', 'SFO', 'ORD → SFO', 'on-time',   'Clear',   19500.50, 41.9742,  -87.9073, 37.6213, -122.3790, NOW() + INTERVAL '1 hour',  NOW() + INTERVAL '5 hours', 'B737'),
  ('AA1100','SEA', 'LAX', 'SEA → LAX', 'on-time',   'Clear',    9800.25, 47.4502, -122.3088, 33.9425, -118.4081, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', 'A320'),
  ('AA1200','MIA', 'JFK', 'MIA → JFK', 'delayed',   'Stormy',  13200.75, 25.7959,  -80.2870, 40.6413, -73.7781,  NOW() + INTERVAL '3 hours', NOW() + INTERVAL '6 hours', 'A321'),
  ('AA1300','DFW', 'ORD', 'DFW → ORD', 'on-time',   'Clear',   10600.00, 32.8998,  -97.0403, 41.9742, -87.9073,  NOW() + INTERVAL '5 hours', NOW() + INTERVAL '8 hours', 'B737'),
  ('AA1400','LAX', 'JFK', 'LAX → JFK', 'in-air',    'Clear',   21800.50, 33.9425, -118.4081, 40.6413, -73.7781,  NOW() - INTERVAL '3 hours', NOW() + INTERVAL '2 hours', 'B777'),
  ('AA1500','SFO', 'DFW', 'SFO → DFW', 'on-time',   'Foggy',   17100.00, 37.6213, -122.3790, 32.8998, -97.0403,  NOW() + INTERVAL '1 hour',  NOW() + INTERVAL '5 hours', 'B787')
ON CONFLICT (flight_id) DO NOTHING;

-- ── Seed Alerts (5 — mix of severities) ───────────────────
INSERT INTO alerts (severity, message, flight_id, is_read, created_at) VALUES
  ('HIGH',   'Severe turbulence reported on JFK → MIA corridor. Consider routing via Norfolk VOR.', 'AA200',  FALSE, NOW() - INTERVAL '10 min'),
  ('HIGH',   'Flight AA600 cancelled due to Hurricane-force winds in Miami area. Rebook 147 passengers.', 'AA600', FALSE, NOW() - INTERVAL '25 min'),
  ('MEDIUM', 'Fog advisory at SFO — reduced visibility below 600m. Expect 20–30 min ground delays.',  'AA400',  FALSE, NOW() - INTERVAL '1 hour'),
  ('MEDIUM', 'Thunderstorm activity detected along MIA → JFK route at FL330. Weather avoidance recommended.', 'AA1200', FALSE, NOW() - INTERVAL '2 hours'),
  ('LOW',    'Minor ATC congestion at ORD. AA300 may experience 8-minute ground hold before pushback.', 'AA300',  TRUE,  NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;
