# FlightZone AI — Frontend Foundation (Person 1)

**CS 3354 — Software Engineering | Person 1: Frontend Foundation Lead**

---

## What's in this folder

This is the complete React frontend app shell. It provides:

| File | What it does |
|------|--------------|
| `src/context/AuthContext.jsx` | Global auth state — JWT token + user, `login()`, `logout()` |
| `src/api.js` | Pre-configured axios with JWT header + 401 auto-redirect |
| `src/components/ProtectedRoute.jsx` | Route guard — redirects to `/login` if not authenticated |
| `src/components/Sidebar.jsx` | Collapsible sidebar nav with role-aware admin link |
| `src/components/AppShell.jsx` | Layout wrapper: Sidebar + main content area |
| `src/pages/LoginPage.jsx` | Full login form → `POST /api/auth/login` → stores JWT |
| `src/pages/DashboardPage.jsx` | Overview: live stat cards, recent flights table, alerts feed |
| `src/pages/FlightsPage.jsx` | **Stub for Person 2** — replace contents with full implementation |
| `src/pages/OptimizationPage.jsx` | **Provided by Person 3** — copy from their branch |
| `src/pages/RouteRecommendationsPage.jsx` | **Provided by Person 3** — copy from their branch |
| `src/pages/AlertsPage.jsx` | **Stub for Person 4** — replace contents with full implementation |
| `src/pages/AdminPage.jsx` | **Stub for Person 4** — replace contents with full implementation |
| `src/pages/ContactPage.jsx` | Contact form → `POST /api/contact` |
| `src/App.jsx` | All routes defined — add new routes here |
| `src/index.css` | Global reset + DM Sans/DM Mono fonts + scrollbar + animations |

---

## Getting Started

### 1. Prerequisites
- Node.js ≥ 18
- Person 3's backend running on `http://localhost:5000`

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env.local
# Set REACT_APP_API_URL if backend is not on localhost:5000
```

### 4. Copy Person 3's pages
Copy these two files from Person 3's branch into `src/pages/`:
- `OptimizationPage.jsx`
- `RouteRecommendationsPage.jsx`

### 5. Start
```bash
npm start   # Opens http://localhost:3000
```

### 6. Test login
| Role       | Employee ID | Password        |
|------------|-------------|-----------------|
| Admin      | `EMP001`    | `Admin@1234`    |
| Dispatcher | `EMP002`    | `Dispatch@1234` |
| Pilot      | `EMP003`    | `Pilot@1234`    |

---

## For Person 2 — Flights Dashboard Lead

Replace `src/pages/FlightsPage.jsx` with your implementation.

Available APIs (Person 3's backend):
- `GET /api/flights` — list with `?status=`, `?search=`, `?date=`
- `GET /api/flights/:flightId` — single flight

Use the shared `api` instance from `src/api.js` — it auto-attaches the JWT.

---

## For Person 4 — Alerts, Admin & QA Lead

Replace `src/pages/AlertsPage.jsx` and `src/pages/AdminPage.jsx` with your implementations.

Available APIs (Person 3's backend):
- `GET /api/alerts`, `PATCH /api/alerts/:id/read`, `GET /api/alerts/system`
- `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `POST /api/admin/users`

The admin route (`/admin`) is already protected with `role="admin"` — only admin users can access it.

---

## Deployment → Vercel

```bash
vercel   # from this folder
# Set REACT_APP_API_URL to your Render backend URL
```

---

## Requirements Satisfied (Person 1)

FR1 (login/auth UI), FR2 (JWT integration), FR14 (contact form), NF1 (consistent design system), NF3 (responsive shell)
