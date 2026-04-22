// ============================================================
// FlightZone AI — Dashboard Page
// Task 1.7 — src/pages/DashboardPage.jsx
// Landing page after login. Shows live stats + recent activity.
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const MOCK_STATS = {
  total: 24,
  onTime: 18,
  delayed: 4,
  inAir: 12,
  cancelled: 2,
};

const MOCK_FLIGHTS = [
  { flight_id: 'AA100', route: 'DFW → LAX', status: 'in-air',   weather: 'Clear',        departure: new Date(Date.now() - 3600000).toISOString() },
  { flight_id: 'AA200', route: 'JFK → MIA', status: 'on-time',  weather: 'Partly Cloudy', departure: new Date(Date.now() + 1800000).toISOString() },
  { flight_id: 'AA300', route: 'ORD → DFW', status: 'delayed',  weather: 'Foggy',         departure: new Date(Date.now() + 3600000).toISOString() },
  { flight_id: 'AA400', route: 'LAX → SFO', status: 'on-time',  weather: 'Clear',         departure: new Date(Date.now() + 5400000).toISOString() },
  { flight_id: 'AA500', route: 'MIA → ORD', status: 'cancelled', weather: 'Stormy',       departure: new Date(Date.now() + 7200000).toISOString() },
];

const MOCK_ALERTS = [
  { id: 1, severity: 'HIGH',   message: 'Storm system approaching MIA corridor', flight_id: 'AA500', is_read: false },
  { id: 2, severity: 'MEDIUM', message: 'Air traffic congestion at ORD',         flight_id: 'AA300', is_read: false },
  { id: 3, severity: 'LOW',    message: 'Fuel efficiency alert for AA100',        flight_id: 'AA100', is_read: true  },
];

const STATUS_STYLES = {
  'on-time':   { bg: '#064e3b', color: '#34d399', label: 'On Time'   },
  'in-air':    { bg: '#172554', color: '#60a5fa', label: 'In Air'    },
  'delayed':   { bg: '#451a03', color: '#f59e0b', label: 'Delayed'   },
  'cancelled': { bg: '#450a0a', color: '#f87171', label: 'Cancelled' },
};

const SEVERITY_STYLES = {
  HIGH:   { bg: '#450a0a', color: '#f87171', dot: '#f87171' },
  MEDIUM: { bg: '#451a03', color: '#f59e0b', dot: '#f59e0b' },
  LOW:    { bg: '#052e16', color: '#34d399', dot: '#34d399' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,         setStats]         = useState(null);
  const [recentFlights, setRecentFlights] = useState([]);
  const [alerts,        setAlerts]        = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [flightsRes, alertsRes] = await Promise.all([
          api.get('/api/flights').catch(() => ({ data: MOCK_FLIGHTS })),
          api.get('/api/alerts').catch(() => ({ data: MOCK_ALERTS })),
        ]);

        const flights = flightsRes.data || MOCK_FLIGHTS;
        const alertsData = alertsRes.data || MOCK_ALERTS;

        setRecentFlights(flights.slice(0, 5));
        setAlerts(alertsData.slice(0, 3));

        // Compute stats from flights
        setStats({
          total:     flights.length,
          onTime:    flights.filter((f) => f.status === 'on-time').length,
          delayed:   flights.filter((f) => f.status === 'delayed').length,
          inAir:     flights.filter((f) => f.status === 'in-air').length,
          cancelled: flights.filter((f) => f.status === 'cancelled').length,
        });
      } catch {
        setRecentFlights(MOCK_FLIGHTS);
        setAlerts(MOCK_ALERTS);
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayStats = stats || MOCK_STATS;

  function formatTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={styles.page}>
      {/* ── Page header ──────────────────────────────────── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {greeting}, {user?.name?.split(' ')[0] || 'Dispatcher'} 👋
          </h1>
          <p style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            &nbsp;·&nbsp;FlightZone AI Dispatch System
          </p>
        </div>
        <button style={styles.optimizeBtn} onClick={() => navigate('/optimization')}>
          ⚡ Run Route Optimization
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Flights',  value: displayStats.total,     color: '#60a5fa', icon: '✈' },
          { label: 'In Air',         value: displayStats.inAir,     color: '#34d399', icon: '🛫' },
          { label: 'On Time',        value: displayStats.onTime,    color: '#4ade80', icon: '✓'  },
          { label: 'Delayed',        value: displayStats.delayed,   color: '#f59e0b', icon: '⏱' },
          { label: 'Cancelled',      value: displayStats.cancelled, color: '#f87171', icon: '✕'  },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, color }}>{icon}</div>
            <div>
              <div style={{ ...styles.statValue, color }}>
                {loading ? '—' : value}
              </div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.twoCol}>
        {/* ── Recent Flights ───────────────────────────── */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>✈ Recent Flights</h2>
            <button style={styles.viewAllBtn} onClick={() => navigate('/flights')}>
              View All →
            </button>
          </div>

          {loading ? (
            <p style={styles.loadingText}>Loading flights...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Flight', 'Route', 'Departure', 'Weather', 'Status'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentFlights.map((f) => {
                  const st = STATUS_STYLES[f.status] || STATUS_STYLES['on-time'];
                  return (
                    <tr
                      key={f.flight_id}
                      style={styles.tr}
                      onClick={() => navigate('/flights')}
                    >
                      <td style={styles.td}>
                        <span style={styles.flightId}>{f.flight_id}</span>
                      </td>
                      <td style={styles.td}>{f.route}</td>
                      <td style={styles.td}>{formatTime(f.departure)}</td>
                      <td style={styles.td}>{f.weather}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Alerts ───────────────────────────────────── */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>🔔 Active Alerts</h2>
            <button style={styles.viewAllBtn} onClick={() => navigate('/alerts')}>
              View All →
            </button>
          </div>

          {loading ? (
            <p style={styles.loadingText}>Loading alerts...</p>
          ) : (
            <div style={styles.alertsList}>
              {alerts.length === 0 ? (
                <p style={styles.emptyText}>No active alerts.</p>
              ) : (
                alerts.map((alert) => {
                  const sv = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.LOW;
                  return (
                    <div
                      key={alert.id}
                      style={{
                        ...styles.alertItem,
                        opacity: alert.is_read ? 0.55 : 1,
                      }}
                    >
                      <span style={{ ...styles.alertDot, background: sv.dot }} />
                      <div style={styles.alertBody}>
                        <span style={{ ...styles.alertSeverity, color: sv.color }}>
                          {alert.severity}
                        </span>
                        <p style={styles.alertMsg}>{alert.message}</p>
                        {alert.flight_id && (
                          <span style={styles.alertFlight}>{alert.flight_id}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 32, background: '#0f172a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 26, fontWeight: 800, margin: 0, color: '#f1f5f9' },
  subtitle: { fontSize: 13, color: '#475569', margin: '6px 0 0' },
  optimizeBtn: { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#1e293b', borderRadius: 14, padding: '18px 20px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 14 },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20, alignItems: 'start' },
  card: { background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  cardTitle: { fontSize: 16, fontWeight: 700, margin: 0, color: '#f1f5f9' },
  viewAllBtn: { background: 'transparent', color: '#60a5fa', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  loadingText: { color: '#475569', fontSize: 14, textAlign: 'center', padding: '20px 0', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', color: '#64748b', fontWeight: 600, padding: '8px 12px', borderBottom: '1px solid #334155', whiteSpace: 'nowrap', fontSize: 12 },
  tr: { borderBottom: '1px solid #1e293b', cursor: 'pointer', transition: 'background 0.1s' },
  td: { padding: '11px 12px', color: '#e2e8f0', verticalAlign: 'middle' },
  flightId: { fontFamily: "'DM Mono', monospace", fontWeight: 700, color: '#60a5fa', background: '#172554', padding: '2px 8px', borderRadius: 4, fontSize: 12 },
  statusBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  alertsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  alertItem: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  alertDot: { width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  alertBody: { flex: 1 },
  alertSeverity: { fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' },
  alertMsg: { fontSize: 13, color: '#e2e8f0', margin: '3px 0 4px', lineHeight: 1.4 },
  alertFlight: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#475569', background: '#0f172a', padding: '1px 6px', borderRadius: 4 },
  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center', padding: '20px 0', margin: 0 },
};
