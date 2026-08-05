# FlightZone AI

FlightZone AI is a full-stack flight operations platform built for airline dispatchers: live flight tracking, weather-aware route optimization, and role-based admin tooling. Built as a team capstone project for CS 3354 (Software Engineering).

## What it does

Dispatchers need to see what's happening across a route network and make fast calls when weather or congestion threatens a flight. FlightZone AI gives them:

- **Live dashboard** — real-time stats on active, delayed, and on-time flights, with a recent activity feed
- **Flight map** — an interactive Leaflet map of tracked routes with live status
- **Route optimization** — a scoring engine that weighs weather risk, airport congestion, and fuel cost to recommend the best of several route options for a flight
- **Analytics** — on-time performance and fuel burn trends by route
- **Alerts** — system and operational alerts with read/unread tracking
- **Admin panel** — user management, restricted to admin roles

## Architecture

**Frontend** — React app with route-based pages, a shared Axios client that auto-attaches JWTs, and a protected-route wrapper for auth-gated pages.

**Backend** — Node/Express API backed by Postgres, with:

- JWT authentication and role-based middleware (`admin`, `dispatcher`, `pilot`)
- Live flight data via the Aviationstack API, polled on a cron schedule
- Weather risk scoring via OpenWeatherMap, cached to stay within free-tier limits
- A route optimization engine (`POST /api/optimize`) that scores candidate routes on weather risk (40%), congestion (30%), and fuel cost (30%)

```
src/
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── FlightsPage.jsx              # live map view
│   ├── AnalyticsPage.jsx            # on-time / fuel charts
│   ├── OptimizationPage.jsx         # route optimization
│   ├── RouteRecommendationsPage.jsx
│   ├── AlertsPage.jsx
│   ├── AdminPage.jsx
│   └── ContactPage.jsx
├── context/AuthContext.jsx
├── components/{AppShell,Sidebar,ProtectedRoute}.jsx
└── api.js

server/
├── routes/{auth,flights,optimize,alerts,admin,contact}.js
├── services/{aviationService,weatherService}.js
├── middleware/authMiddleware.js
└── database/{schema.sql,seed.sql}
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios, Leaflet, Recharts |
| Backend | Node.js, Express, PostgreSQL |
| Auth | JWT, bcrypt |
| External APIs | Aviationstack (flight data), OpenWeatherMap (weather risk) |
| Deployment | Vercel (frontend), Render (backend) |

## Running locally

**Backend**

```bash
cd server
npm install
cp .env.example .env      # set DATABASE_URL and API keys
npm run seed               # create schema and seed data
npm run dev                 # http://localhost:5000
```

**Frontend**

```bash
npm install
npm start                   # http://localhost:3000
```

### Test accounts

| Role | Employee ID | Password |
|---|---|---|
| Admin | `EMP001` | `Admin@1234` |
| Dispatcher | `EMP002` | `Dispatch@1234` |
| Pilot | `EMP003` | `Pilot@1234` |

## Team

Built by a four-person team covering frontend foundation/auth, the flights dashboard, the backend and optimization engine, and alerts/admin/QA.
