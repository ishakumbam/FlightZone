// ============================================================
// FlightZone AI — Alerts Page Stub
// Task 1.9 — src/pages/AlertsPage.jsx
// This is a STUB page for Person 4 (Alerts, Admin & QA Lead).
// Person 4 replaces the content of this file with their full
// implementation while keeping the same file path.
// ============================================================
import React from 'react';

export default function AlertsPage() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔔 Alerts</h1>
        <p style={styles.subtitle}>
          This page is owned by <strong style={{ color: '#f59e0b' }}>Person 4 (Alerts, Admin &amp; QA Lead)</strong>.
          Replace the contents of <code style={styles.code}>src/pages/AlertsPage.jsx</code> with your full implementation.
        </p>
      </div>

      <div style={styles.placeholder}>
        <span style={styles.icon}>🔔</span>
        <p style={styles.placeholderTitle}>Alerts Page — Coming Soon</p>
        <p style={styles.placeholderSub}>
          Person 4 will implement: alert list, severity filters, mark-as-read, and system health panel.
        </p>
        <div style={styles.apiList}>
          <p style={styles.apiTitle}>Backend APIs ready (Person 3):</p>
          <code style={styles.apiItem}>GET /api/alerts</code>
          <code style={styles.apiItem}>PATCH /api/alerts/:id/read</code>
          <code style={styles.apiItem}>GET /api/alerts/system</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:              { padding: 32, background: '#0f172a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' },
  header:            { marginBottom: 32 },
  title:             { fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#f1f5f9' },
  subtitle:          { fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 },
  code:              { fontFamily: "'DM Mono', monospace", fontSize: 13, background: '#1e293b', padding: '1px 6px', borderRadius: 4 },
  placeholder:       { background: '#1e293b', borderRadius: 16, border: '2px dashed #334155', padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  icon:              { fontSize: 48, marginBottom: 8 },
  placeholderTitle:  { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  placeholderSub:    { fontSize: 14, color: '#64748b', margin: 0, maxWidth: 420, lineHeight: 1.6 },
  apiList:           { marginTop: 16, background: '#0f172a', borderRadius: 10, padding: '16px 24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 },
  apiTitle:          { fontSize: 12, color: '#475569', fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 },
  apiItem:           { fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#f59e0b', display: 'block' },
};
