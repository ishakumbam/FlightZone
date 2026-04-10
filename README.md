# FlightZone AI ✈

**CS 3354 — Software Engineering | Prototype MVP**

> AI-powered flight route optimization platform for American Airlines dispatchers.

---

## Live URLs

| Service    | URL |
|------------|-----|
| Frontend   | _Add Vercel URL here after deployment_ |
| Backend API | _Add Render URL here after deployment_ |
| GitHub Repo | https://github.com/ishakumbam/FlightZone |

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, React Router v6, Leaflet, Recharts |
| Backend   | Node.js, Express 4, PostgreSQL |
| Auth      | JWT (jsonwebtoken + bcrypt) |
| DB Host   | Supabase (free tier) |
| Email     | Resend API |
| Deploy    | Vercel (frontend) + Render (backend) |
| Live Data | Aviationstack API + OpenWeatherMap API |

---

## Team

| Person | Role |
|--------|------|
| P1 | Frontend Foundation Lead |
| P2 | Flights Dashboard Lead |
| P3 | Backend & AI Route Optimization Lead |
| P4 | Alerts, Admin & QA Lead |

---

## Getting Started (Person 3 — Backend)

### 1. Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free)

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, and API keys
```

### 3. Seed the Database
```bash
cd server
npm install
node database/seedHelper.js
```

**Seeded Credentials** (share at Sync 1):

| Role        | Employee ID | Password       |
|-------------|-------------|----------------|
| Admin       | `EMP001`    | `Admin@1234`   |
| Dispatcher  | `EMP002`    | `Dispatch@1234`|
| Pilot       | `EMP003`    | `Pilot@1234`   |

### 4. Start the Server
```bash
npm run dev   # development (nodemon)
npm start     # production
```

### 5. Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"EMP001","password":"Admin@1234"}'

# Get flights (with token)
curl http://localhost:5000/api/flights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/flights` | ✅ | List flights (`?status=` `?search=` `?date=`) |
| GET | `/api/flights/:id` | ✅ | Single flight |
| GET | `/api/alerts` | ✅ | All alerts |
| PATCH | `/api/alerts/:id/read` | ✅ | Mark alert as read |
| GET | `/api/alerts/system` | ✅ | System health alerts |
| GET | `/api/admin/users` | ✅ Admin | List all users |
| PATCH | `/api/admin/users/:id` | ✅ Admin | Update role/status |
| POST | `/api/admin/users` | ✅ Admin | Invite new user |
| POST | `/api/optimize` | ✅ | Run route optimization |
| PATCH | `/api/optimize/select` | ✅ | Save selected route |
| GET | `/api/routes/logs` | ✅ | Optimization history |
| POST | `/api/contact` | ❌ | Contact form |
| GET | `/api/health` | ❌ | Health check |

---

## API Keys Setup

### Aviationstack (live flight data)
1. Go to [aviationstack.com/signup/free](https://aviationstack.com/signup/free)
2. Create free account (500 req/month)
3. Copy API key → `.env` `AVIATIONSTACK_KEY`

### OpenWeatherMap (weather risk)
1. Go to [openweathermap.org/api](https://openweathermap.org/api)
2. Sign up free, go to **API Keys** tab
3. Copy key → `.env` `OPENWEATHERMAP_KEY`
4. ⚠️ Keys can take ~10 minutes to activate

### Resend (contact form email)
1. Go to [resend.com/signup](https://resend.com/signup)
2. Create free account (3,000 emails/month free)
3. Go to **API Keys** → Create → copy key → `.env` `RESEND_API_KEY`

### Supabase (PostgreSQL)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → Database → **Connection String** → URI mode
3. Copy URI → `.env` `DATABASE_URL`

---

## Performance

Route optimization engine targets **< 6 seconds** (NF5).

```bash
cd server
chmod +x tests/performance_test.sh
./tests/performance_test.sh
```

Results are logged to `server/performance_log.txt`.

---

## Deployment

### Backend → Render
1. Connect GitHub repo on render.com
2. New Web Service → Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` vars under Environment

### Frontend → Vercel
```bash
vercel  # from React project root
# Set REACT_APP_API_URL to your Render URL
```

---

## Requirements Satisfied (Person 3)

FR2, FR3, FR4, FR9, FR12, FR13, FR17, NF1, NF5
Test Cases: TC3, TC7, TC8, TC9, TC11, TC12
