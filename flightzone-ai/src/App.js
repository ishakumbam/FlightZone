import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AlertsPage from './pages/AlertsPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [alertCount, setAlertCount] = useState(0);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>

        {/* Temporary sidebar */}
        <div style={{
          width: '200px', minHeight: '100vh',
          background: '#1B2A4A', padding: '24px 16px'
        }}>
          <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '24px' }}>FlightZone AI</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/alerts" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Alerts
              {alertCount > 0 && (
                <span style={{
                  background: '#C8102E', color: 'white',
                  borderRadius: '10px', padding: '1px 7px',
                  fontSize: '11px', fontWeight: 600
                }}>
                  {alertCount}
                </span>
              )}
            </Link>
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
          </nav>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, background: '#F3F4F6', minHeight: '100vh' }}>
          <Routes>
            <Route path="/alerts" element={<AlertsPage onUnreadCount={setAlertCount} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<p style={{ padding: '24px' }}>Click a link on the left!</p>} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
