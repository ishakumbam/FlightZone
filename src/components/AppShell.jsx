// ============================================================
// FlightZone AI — App Shell Layout
// Task 1.5 — src/components/AppShell.jsx
// The persistent layout wrapper: Sidebar + main content area.
// All authenticated pages render inside <AppShell>.
// ============================================================
import React from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: "'DM Sans', 'DM Mono', sans-serif",
    color: '#f1f5f9',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    minWidth: 0,
  },
};
