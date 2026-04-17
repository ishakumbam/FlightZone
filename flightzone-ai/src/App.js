import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import AlertsPage from './pages/AlertsPage';
import AdminPage from './pages/AdminPage';
import FlightsDashboard from './pages/FlightsDashboard';
import AnalyticsPage from './pages/AnalyticsPage';

const NAV_ITEMS = [
  { path: '/flights',   label: 'Flights' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/alerts',    label: 'Alerts' },
  { path: '/admin',     label: 'Admin' },
];

function Sidebar({ alertCount }) {
  const { pathname } = useLocation();
  return (
    <div style={{
      width: '200px', minHeight: '100vh',
      background: '#1B2A4A', padding: '24px 16px',
      flexShrink: 0,
    }}>
      <p style={{ color: 'white', fontWeight: 700, marginBottom: '28px', fontSize: '15px' }}>
        FlightZone AI
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {NAV_ITEMS.map(({ path, label }) => {
          const active = pathname === path || (path === '/flights' && pathname === '/');
          return (
            <Link
              key={path}
              to={path}
              style={{
                color: active ? 'white' : '#94a3b8',
                textDecoration: 'none',
                fontWeight: active ? 700 : 400,
                background: active ? '#2563EB' : 'transparent',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s',
              }}
            >
              {label}
              {label === 'Alerts' && alertCount > 0 && (
                <span style={{
                  background: '#C8102E', color: 'white',
                  borderRadius: '10px', padding: '1px 7px',
                  fontSize: '11px', fontWeight: 600,
                }}>
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function App() {
  const [alertCount, setAlertCount] = useState(0);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar alertCount={alertCount} />
        <div style={{ flex: 1, background: '#F3F4F6', minHeight: '100vh' }}>
          <Routes>
            <Route path="/"          element={<FlightsDashboard />} />
            <Route path="/flights"   element={<FlightsDashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts"    element={<AlertsPage onUnreadCount={setAlertCount} />} />
            <Route path="/admin"     element={<AdminPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
