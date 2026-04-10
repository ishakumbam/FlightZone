// ============================================================
// FlightZone AI — Route Recommendations Page
// Task 3.15 — src/pages/RouteRecommendationsPage.jsx
// ============================================================
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mock data shown when navigated to directly without state
const MOCK_FLIGHT = { flight_id: 'AA100', route: 'DFW → LAX', departure: new Date().toISOString() };
const MOCK_ROUTES = [
  { routeId: 'A', label: 'Aggressive',   fuelBurn: 16280,  riskScore: 0.78, passengerImpact: 'Minor turbulence possible',      delayMinutes: 5,  estimatedTime: '3h 10m', savings: '+12% fuel efficiency' },
  { routeId: 'B', label: 'Balanced',     fuelBurn: 18500,  riskScore: 0.42, passengerImpact: 'Smooth ride expected',            delayMinutes: 12, estimatedTime: '3h 25m', savings: 'Recommended'           },
  { routeId: 'C', label: 'Conservative', fuelBurn: 21090,  riskScore: 0.18, passengerImpact: 'Maximum comfort, weather avoided', delayMinutes: 20, estimatedTime: '3h 45m', savings: 'Lowest risk score'     },
];

// Alert severity triangles based on risk score
function SafetyTriangles({ risk }) {
  const count = risk >= 0.7 ? 3 : risk >= 0.4 ? 2 : 1;
  const color  = risk >= 0.7 ? '#ef4444' : risk >= 0.4 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ fontSize: 18, color }}>▲</span>
      ))}
      <span style={{ fontSize: 12, color, marginLeft: 4, fontWeight: 600 }}>
        {risk >= 0.7 ? 'HIGH RISK' : risk >= 0.4 ? 'MEDIUM RISK' : 'LOW RISK'}
      </span>
    </div>
  );
}

// Risk score gauge bar
function RiskBar({ score }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? '#ef4444' : score >= 0.4 ? '#f59e0b' : '#22c55e';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Risk Score</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// Route card color schemes
const CARD_THEMES = {
  A: { gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', accent: '#818cf8', border: '#4338ca' },
  B: { gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)', accent: '#4ade80', border: '#15803d' },
  C: { gradient: 'linear-gradient(135deg, #172554 0%, #1e3a5f 100%)', accent: '#60a5fa', border: '#2563eb' },
};

export default function RouteRecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { routes, flight, logId, timeframe } = location.state || {};
  const displayRoutes = routes || MOCK_ROUTES;
  const displayFlight = flight || MOCK_FLIGHT;

  const [selected, setSelected]       = useState(null);
  const [selecting, setSelecting]     = useState(null); // routeId being saved
  const [success, setSuccess]         = useState('');
  const [error, setError]             = useState('');

  async function handleSelect(route) {
    setSelecting(route.routeId);
    setError('');
    try {
      if (logId) {
        const token = localStorage.getItem('fz_token');
        await axios.patch(
          `${API_BASE}/api/optimize/select`,
          {
            logId,
            routeId: route.routeId,
            label: route.label,
            fuelBurn: route.fuelBurn,
            riskScore: route.riskScore,
            delayMinutes: route.delayMinutes,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSelected(route.routeId);
      setSuccess(`Route ${route.routeId} (${route.label}) selected and logged successfully.`);
    } catch {
      setError('Failed to save selection. Route noted locally.');
      setSelected(route.routeId);
    } finally {
      setSelecting(null);
    }
  }

  function formatDepTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={styles.page}>
      {/* ── Back nav ───────────────────────────────────────── */}
      <button style={styles.backBtn} onClick={() => navigate('/optimization')}>
        ← Back to Optimization
      </button>

      {/* ── Flight Header ─────────────────────────────────── */}
      <div style={styles.flightHeader}>
        <div>
          <div style={styles.flightMeta}>
            <span style={styles.flightIdBadge}>{displayFlight.flight_id}</span>
            <span style={styles.flightRoute}>{displayFlight.route}</span>
            {timeframe && <span style={styles.timeframeBadge}>{timeframe}</span>}
          </div>
          <p style={styles.depTime}>
            📅 {formatDepTime(displayFlight.departure)}
          </p>
        </div>
        <div style={styles.aiLabel}>
          <span style={styles.aiIcon}>🤖</span>
          <span style={styles.aiText}>AI Route Analysis</span>
        </div>
      </div>

      {/* ── Congestion Heatmap placeholder ────────────────── */}
      <div style={styles.heatmapCard}>
        <div style={styles.heatmapHeader}>
          <span>🗺 Airspace Congestion Heatmap</span>
          <span style={styles.liveTag}>● LIVE</span>
        </div>
        <div style={styles.heatmap}>
          {/* Visual heatmap bands representing congestion zones */}
          {['#064e3b','#065f46','#047857','#15803d','#166534','#14532d',
            '#15803d','#047857','#059669','#34d399'].map((c, i) => (
            <div key={i} style={{ ...styles.heatBand, background: c, opacity: 0.6 + i * 0.04 }} />
          ))}
          <div style={styles.heatmapOverlay}>
            <span style={styles.heatmapLabel}>Congestion data rendering...</span>
            <span style={styles.heatmapSub}>Connect Aviationstack API for live data</span>
          </div>
        </div>
      </div>

      {/* ── Success / Error messages ───────────────────────── */}
      {success && <div style={styles.successBanner}>{success}</div>}
      {error   && <div style={styles.errorBanner}>{error}</div>}

      {/* ── Route Cards ───────────────────────────────────── */}
      <h2 style={styles.sectionTitle}>
        Select Optimal Route
        <span style={styles.routeCount}>{displayRoutes.length} options</span>
      </h2>

      <div style={styles.cardsGrid}>
        {displayRoutes.map((route) => {
          const theme     = CARD_THEMES[route.routeId] || CARD_THEMES.B;
          const isSelected = selected === route.routeId;
          const isLoading  = selecting === route.routeId;

          return (
            <div
              key={route.routeId}
              id={`route-card-${route.routeId}`}
              style={{
                ...styles.card,
                background: theme.gradient,
                border: isSelected ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                transform: isSelected ? 'translateY(-4px)' : 'none',
                boxShadow: isSelected ? `0 0 24px ${theme.accent}40` : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Card Header */}
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.routeLabel}>Route {route.routeId}</div>
                  <div style={{ ...styles.routeName, color: theme.accent }}>{route.label}</div>
                </div>
                <SafetyTriangles risk={route.riskScore} />
              </div>

              {route.strategy && (
                <p style={styles.strategy}>{route.strategy}</p>
              )}

              {/* Metrics grid */}
              <div style={styles.metricsGrid}>
                <div style={styles.metric}>
                  <span style={styles.metricIcon}>⛽</span>
                  <span style={styles.metricLabel}>Fuel Burn</span>
                  <span style={{ ...styles.metricValue, color: theme.accent }}>
                    {route.fuelBurn.toLocaleString()} kg
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricIcon}>🕐</span>
                  <span style={styles.metricLabel}>Est. Time</span>
                  <span style={styles.metricValue}>{route.estimatedTime}</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricIcon}>⏱</span>
                  <span style={styles.metricLabel}>Delay</span>
                  <span style={styles.metricValue}>+{route.delayMinutes} min</span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricIcon}>👥</span>
                  <span style={styles.metricLabel}>Passenger Impact</span>
                  <span style={styles.metricValue}>{route.passengerImpact}</span>
                </div>
              </div>

              {/* Risk bar */}
              <div style={{ marginBottom: 16 }}>
                <RiskBar score={route.riskScore} />
              </div>

              {/* Savings tag */}
              <div style={{ ...styles.savingsTag, borderColor: theme.border, color: theme.accent }}>
                ✓ {route.savings}
              </div>

              {/* Select button */}
              <button
                id={`select-route-${route.routeId}`}
                style={{
                  ...styles.selectBtn,
                  background: isSelected ? theme.accent : 'transparent',
                  color: isSelected ? '#0f172a' : theme.accent,
                  border: `2px solid ${theme.accent}`,
                  opacity: isLoading ? 0.7 : 1,
                }}
                onClick={() => !isSelected && handleSelect(route)}
                disabled={isLoading || !!selected}
              >
                {isLoading ? '⟳ Saving...' : isSelected ? '✓ ROUTE SELECTED' : 'SELECT ROUTE'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── After selection CTA ───────────────────────────── */}
      {selected && (
        <div style={styles.postSelect}>
          <p style={styles.postSelectText}>
            Route <strong>{selected}</strong> has been logged. View in Optimization Logs.
          </p>
          <button style={styles.viewLogsBtn} onClick={() => navigate('/optimization')}>
            View Optimization Logs →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = {
  page: { padding: '28px 32px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f1f5f9' },
  backBtn: { background: 'transparent', color: '#60a5fa', border: 'none', fontSize: 14, cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 },
  flightHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#1e293b', borderRadius: 12, padding: '16px 24px', border: '1px solid #334155' },
  flightMeta: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' },
  flightIdBadge: { background: '#172554', color: '#60a5fa', fontFamily: 'monospace', fontWeight: 700, fontSize: 18, padding: '4px 12px', borderRadius: 6 },
  flightRoute: { fontSize: 18, fontWeight: 600, color: '#f1f5f9' },
  timeframeBadge: { background: '#1e3a5f', color: '#93c5fd', padding: '3px 10px', borderRadius: 12, fontSize: 12 },
  depTime: { margin: 0, fontSize: 13, color: '#94a3b8' },
  aiLabel: { display: 'flex', alignItems: 'center', gap: 8, background: '#1e1b4b', padding: '8px 16px', borderRadius: 10, border: '1px solid #4338ca' },
  aiIcon: { fontSize: 20 },
  aiText: { fontSize: 13, fontWeight: 600, color: '#a5b4fc' },
  heatmapCard: { background: '#1e293b', borderRadius: 12, marginBottom: 24, overflow: 'hidden', border: '1px solid #334155' },
  heatmapHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #334155', fontSize: 14, fontWeight: 600, color: '#94a3b8' },
  liveTag: { color: '#22c55e', fontSize: 12, fontWeight: 700, animation: 'pulse 2s infinite' },
  heatmap: { position: 'relative', height: 80, display: 'flex' },
  heatBand: { flex: 1 },
  heatmapOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
  heatmapLabel: { fontSize: 13, fontWeight: 600, color: '#f1f5f9' },
  heatmapSub: { fontSize: 11, color: '#94a3b8' },
  sectionTitle: { fontSize: 20, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 12 },
  routeCount: { fontSize: 13, background: '#1e293b', color: '#94a3b8', padding: '3px 10px', borderRadius: 12, fontWeight: 400 },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 },
  card: { borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  routeLabel: { fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
  routeName: { fontSize: 22, fontWeight: 800, marginTop: 2 },
  strategy: { fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  metric: { background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  metricIcon: { fontSize: 16 },
  metricLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500 },
  metricValue: { fontSize: 14, fontWeight: 700, color: '#f1f5f9' },
  savingsTag: { border: '1px solid', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, textAlign: 'center' },
  selectBtn: { borderRadius: 10, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5 },
  successBanner: { background: '#064e3b', color: '#34d399', borderRadius: 10, padding: '12px 20px', marginBottom: 16, fontSize: 14 },
  errorBanner: { background: '#450a0a', color: '#f87171', borderRadius: 10, padding: '12px 20px', marginBottom: 16, fontSize: 14 },
  postSelect: { background: '#1e293b', borderRadius: 12, padding: '20px 24px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  postSelectText: { margin: 0, fontSize: 14, color: '#94a3b8' },
  viewLogsBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
};
