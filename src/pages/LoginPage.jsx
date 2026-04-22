// ============================================================
// FlightZone AI — Login Page
// Task 1.6 — src/pages/LoginPage.jsx
// POST /api/auth/login  →  stores JWT  →  redirects to /dashboard
// ============================================================
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [employeeId, setEmployeeId] = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Already logged in — skip straight to app
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!employeeId.trim() || !password) {
      setError('Employee ID and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', {
        employeeId: employeeId.trim(),
        password,
      });
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Background grid ──────────────────────────────── */}
      <div style={styles.bgGrid} />
      <div style={styles.bgGlow} />

      <div style={styles.card}>
        {/* ── Logo ──────────────────────────────────────── */}
        <div style={styles.logoBlock}>
          <span style={styles.logoIcon}>✈</span>
          <div>
            <div style={styles.logoText}>FlightZone AI</div>
            <div style={styles.logoSub}>American Airlines Dispatch System</div>
          </div>
        </div>

        <h1 style={styles.heading}>Sign In</h1>
        <p style={styles.subheading}>Enter your crew credentials to continue</p>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              autoComplete="username"
              placeholder="e.g. EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={styles.input}
              disabled={loading}
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <span style={styles.spinner} />
                Authenticating...
              </span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* ── Demo credentials hint ─────────────────────── */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo Credentials</p>
          <div style={styles.demoGrid}>
            {[
              { role: 'Admin',       id: 'EMP001', pw: 'Admin@1234'    },
              { role: 'Dispatcher',  id: 'EMP002', pw: 'Dispatch@1234' },
              { role: 'Pilot',       id: 'EMP003', pw: 'Pilot@1234'    },
            ].map(({ role, id, pw }) => (
              <button
                key={id}
                style={styles.demoBtn}
                type="button"
                onClick={() => { setEmployeeId(id); setPassword(pw); setError(''); }}
              >
                <span style={styles.demoRole}>{role}</span>
                <span style={styles.demoId}>{id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#060d1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: 24,
  },
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  bgGlow: {
    position: 'absolute',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 400,
    background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: '#0d1829',
    borderRadius: 20,
    border: '1px solid #1e3a5f',
    padding: '40px 44px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid #1e293b',
  },
  logoIcon: {
    fontSize: 32,
    filter: 'drop-shadow(0 0 10px #2563eb)',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: 0.5,
    fontFamily: "'DM Mono', monospace",
  },
  logoSub: {
    fontSize: 11,
    color: '#475569',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heading: {
    fontSize: 26,
    fontWeight: 800,
    color: '#f1f5f9',
    margin: '0 0 6px',
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    margin: '0 0 28px',
  },
  errorBox: {
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: 10,
    color: '#f87171',
    padding: '12px 16px',
    fontSize: 13,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: { fontSize: 14 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
  },
  input: {
    background: '#060d1a',
    border: '1px solid #1e3a5f',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#f1f5f9',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '14px 0',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
    letterSpacing: 0.5,
    boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
    transition: 'opacity 0.2s',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.2)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  demoBox: {
    marginTop: 28,
    paddingTop: 20,
    borderTop: '1px solid #1e293b',
  },
  demoTitle: {
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 600,
    margin: '0 0 10px',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  demoBtn: {
    background: '#131f35',
    border: '1px solid #1e3a5f',
    borderRadius: 8,
    padding: '8px 6px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    transition: 'border-color 0.15s',
  },
  demoRole: {
    fontSize: 11,
    color: '#60a5fa',
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  demoId: {
    fontSize: 10,
    color: '#475569',
    fontFamily: "'DM Mono', monospace",
  },
};
