// ============================================================
// FlightZone AI — Optimization Page
// Task 3.14 — src/pages/OptimizationPage.jsx
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Toggle: set to false when real backend is ready ────────
const USE_MOCK = true;

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mock data for optimization logs (used when USE_MOCK = true)
const MOCK_LOGS = [
  { id: 1, flight_id: 'AA100', route: 'DFW → LAX', selected_route: 'B', route_label: 'Balanced',      status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, flight_id: 'AA200', route: 'JFK → MIA', selected_route: 'C', route_label: 'Conservative',  status: 'completed', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, flight_id: 'AA300', route: 'ORD → DFW', selected_route: null, route_label: null,             status: 'pending',   created_at: new Date(Date.now() - 900000).toISOString()  },
];

const TIMEFRAMES = ['Today', 'Next 6 Hours', 'Next 12 Hours', 'This Week'];

const OPTIMIZATION_SETTINGS = [
  { id: 'weather',    label: 'Weather Risk Weighting',    value: '40%',      description: 'Prioritise weather avoidance in route scoring' },
  { id: 'congestion', label: 'Air Traffic Congestion',    value: '30%',      description: 'Factor in ATC-reported congestion levels'      },
  { id: 'fuel',       label: 'Fuel Cost Optimisation',    value: '30%',      description: 'Balance fuel burn against schedule adherence'  },
];

export default function OptimizationPage() {
  const navigate = useNavigate();

  const [timeframe, setTimeframe]         = useState('Today');
  const [flightId, setFlightId]           = useState('AA100');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [logs, setLogs]                   = useState([]);
  const [logsLoading, setLogsLoading]     = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [editValue, setEditValue]         = useState('');

  // ── Fetch optimization logs on mount ──────────────────────
  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLogsLoading(true);
    try {
      if (USE_MOCK) {
        setLogs(MOCK_LOGS);
      } else {
        const token = localStorage.getItem('fz_token');
        const { data } = await axios.get(`${API_BASE}/api/routes/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(data);
      }
    } catch {
      setLogs(MOCK_LOGS); // fallback
    } finally {
      setLogsLoading(false);
    }
  }

  // ── Run optimization ───────────────────────────────────────
  async function handleRunOptimization() {
    if (!flightId.trim()) {
      setError('Please enter a Flight ID (e.g. AA100)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let routes;

      if (USE_MOCK) {
        // Simulate API latency
        await new Promise((r) => setTimeout(r, 800));
        routes = getMockRoutes(flightId.toUpperCase());
      } else {
        const token = localStorage.getItem('fz_token');
        const { data } = await axios.post(
          `${API_BASE}/api/optimize`,
          { flightId: flightId.toUpperCase(), timeframe },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        routes = data.routes;
        // Navigate with all data
        navigate('/route-recommendations', {
          state: { routes: data.routes, flight: data.flight, logId: data.logId, timeframe },
        });
        return;
      }

      navigate('/route-recommendations', {
        state: { routes, flight: { flight_id: flightId.toUpperCase(), route: `${flightId.toUpperCase()} Route` }, logId: null, timeframe },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Optimization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getMockRoutes(id) {
    const baseFuel = 15000 + Math.random() * 8000;
    return [
      { routeId: 'A', label: 'Aggressive',   fuelBurn: Math.round(baseFuel * 0.88), riskScore: 0.78, passengerImpact: 'Minor turbulence possible',     delayMinutes: 5,  estimatedTime: '3h 10m', savings: '+12% fuel efficiency' },
      { routeId: 'B', label: 'Balanced',     fuelBurn: Math.round(baseFuel * 1.00), riskScore: 0.42, passengerImpact: 'Smooth ride expected',           delayMinutes: 12, estimatedTime: '3h 25m', savings: 'Recommended'            },
      { routeId: 'C', label: 'Conservative', fuelBurn: Math.round(baseFuel * 1.14), riskScore: 0.18, passengerImpact: 'Maximum comfort, weather avoided', delayMinutes: 20, estimatedTime: '3h 45m', savings: 'Lowest risk score'      },
    ];
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function getStatusBadge(status) {
    const map = { completed: { bg: '#064e3b', color: '#34d399', text: 'Completed' }, pending: { bg: '#1c1917', color: '#f59e0b', text: 'Pending' }, failed: { bg: '#450a0a', color: '#f87171', text: 'Failed' } };
    const s = map[status] || map.pending;
    return <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{s.text}</span>;
  }

  return (
    <div style={styles.page}>
      {/* ── Page Header ───────────────────────────────────── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Route Optimization</h1>
          <p style={styles.pageSubtitle}>AI-powered route recommendations using weather, congestion, and fuel data</p>
        </div>
        {USE_MOCK && (
          <span style={styles.mockBadge}>⚠ Mock Mode</span>
        )}
      </div>

      <div style={styles.grid}>
        {/* ── Left Column ───────────────────────────────────── */}
        <div style={styles.leftCol}>
          {/* Run Optimization Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>⚡</span>
              <h2 style={styles.cardTitle}>Run Optimization</h2>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Flight ID</label>
              <input
                id="optimization-flight-id"
                style={styles.input}
                value={flightId}
                onChange={(e) => setFlightId(e.target.value)}
                placeholder="e.g. AA100"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Select Time Frame</label>
              <select
                id="optimization-timeframe"
                style={styles.select}
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                {TIMEFRAMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {error && <p style={styles.errorText}>{error}</p>}

            <button
              id="run-optimization-btn"
              style={{ ...styles.runBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleRunOptimization}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingInner}>
                  <span style={styles.spinner} />
                  Analyzing Routes...
                </span>
              ) : (
                '▶ Run Optimization'
              )}
            </button>
          </div>

          {/* Optimization Settings Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>⚙</span>
              <h2 style={styles.cardTitle}>Optimization Settings</h2>
            </div>
            <p style={styles.settingsSubtitle}>Scoring algorithm weights — must total 100%</p>

            {OPTIMIZATION_SETTINGS.map((s) => (
              <div key={s.id} style={styles.settingRow}>
                <div style={styles.settingLeft}>
                  <label style={styles.settingCheckbox}>
                    <input
                      id={`setting-${s.id}`}
                      type="checkbox"
                      defaultChecked
                      style={{ accentColor: '#2563EB' }}
                    />
                    <div>
                      <span style={styles.settingLabel}>{s.label}</span>
                      <span style={styles.settingDesc}>{s.description}</span>
                    </div>
                  </label>
                </div>
                <div style={styles.settingRight}>
                  {editingId === s.id ? (
                    <input
                      style={styles.editInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span style={styles.settingValue}>{s.value}</span>
                      <button
                        style={styles.editBtn}
                        onClick={() => { setEditingId(s.id); setEditValue(s.value); }}
                      >Edit</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column — Optimization Logs ──────────────── */}
        <div style={styles.rightCol}>
          <div style={{ ...styles.card, height: '100%' }}>
            <div style={{ ...styles.cardHeader, justifyContent: 'space-between' }}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>📋</span>
                <h2 style={styles.cardTitle}>Optimization Logs</h2>
              </div>
              <button style={styles.refreshBtn} onClick={fetchLogs} disabled={logsLoading}>
                {logsLoading ? '⟳' : '↻ Refresh'}
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Date', 'Flight', 'Route', 'Selected', 'Status'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    <tr><td colSpan={5} style={styles.centered}>Loading logs...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={5} style={styles.centered}>No optimization runs yet</td></tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>{formatDate(log.created_at)}</td>
                        <td style={styles.td}><span style={styles.flightId}>{log.flight_id}</span></td>
                        <td style={styles.td}>{log.route || '—'}</td>
                        <td style={styles.td}>
                          {log.selected_route
                            ? <span style={styles.routeChip}>Route {log.selected_route} · {log.route_label}</span>
                            : <span style={{ color: '#6b7280' }}>—</span>}
                        </td>
                        <td style={styles.td}>{getStatusBadge(log.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = {
  page: { padding: '32px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f1f5f9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: 700, margin: 0, color: '#f1f5f9' },
  pageSubtitle: { fontSize: 14, color: '#94a3b8', margin: '6px 0 0' },
  mockBadge: { background: '#451a03', color: '#f59e0b', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  rightCol: { minHeight: 400 },
  card: { background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: 18, fontWeight: 600, margin: 0, color: '#f1f5f9' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 },
  input: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  errorText: { color: '#f87171', fontSize: 13, margin: '0 0 12px' },
  runBtn: { width: '100%', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', letterSpacing: 0.5 },
  loadingInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinner: { width: 16, height: 16, border: '2px solid #374151', borderTop: '2px solid #60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
  settingsSubtitle: { fontSize: 13, color: '#64748b', margin: '-12px 0 16px' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' },
  settingLeft: { flex: 1 },
  settingRight: { display: 'flex', alignItems: 'center', gap: 10 },
  settingCheckbox: { display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' },
  settingLabel: { display: 'block', fontSize: 13, fontWeight: 500, color: '#e2e8f0' },
  settingDesc: { display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 },
  settingValue: { fontSize: 14, fontWeight: 700, color: '#60a5fa' },
  editBtn: { background: 'transparent', color: '#60a5fa', border: '1px solid #334155', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' },
  editInput: { width: 60, background: '#0f172a', border: '1px solid #60a5fa', borderRadius: 6, padding: '4px 8px', color: '#f1f5f9', fontSize: 13 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', color: '#64748b', fontWeight: 600, padding: '10px 12px', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #1e293b', transition: 'background 0.15s' },
  td: { padding: '12px 12px', color: '#e2e8f0', verticalAlign: 'middle' },
  centered: { textAlign: 'center', color: '#64748b', padding: '32px 0' },
  flightId: { fontFamily: 'monospace', fontWeight: 700, color: '#60a5fa', background: '#172554', padding: '2px 8px', borderRadius: 4 },
  routeChip: { background: '#064e3b', color: '#34d399', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  refreshBtn: { background: 'transparent', color: '#60a5fa', border: '1px solid #334155', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer' },
};
