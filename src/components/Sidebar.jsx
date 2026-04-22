// ============================================================
// FlightZone AI — Sidebar Navigation
// Task 1.4 — src/components/Sidebar.jsx
// ============================================================
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard',      label: 'Dashboard',         icon: '▦' },
  { path: '/flights',        label: 'Flights',           icon: '✈' },
  { path: '/optimization',   label: 'Route Optimizer',   icon: '⚡' },
  { path: '/alerts',         label: 'Alerts',            icon: '🔔' },
  { path: '/contact',        label: 'Contact',           icon: '✉' },
];

const ADMIN_ITEMS = [
  { path: '/admin',          label: 'Admin Panel',       icon: '⚙' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const roleColors = {
    admin:      { bg: '#1e3a5f', color: '#60a5fa' },
    dispatcher: { bg: '#064e3b', color: '#34d399' },
    pilot:      { bg: '#1c1917', color: '#f59e0b' },
  };
  const roleStyle = roleColors[user?.role] || roleColors.dispatcher;

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 64 : 240 }}>
      {/* ── Logo ───────────────────────────────────────────── */}
      <div style={styles.logoRow}>
        {!collapsed && (
          <div style={styles.logoBlock}>
            <span style={styles.logoIcon}>✈</span>
            <div>
              <div style={styles.logoText}>FlightZone</div>
              <div style={styles.logoSub}>AI Dispatch</div>
            </div>
          </div>
        )}
        <button
          style={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* ── User badge ─────────────────────────────────────── */}
      {!collapsed && user && (
        <div style={styles.userBadge}>
          <div style={styles.userAvatar}>
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name}</div>
            <span style={{ ...styles.roleTag, background: roleStyle.bg, color: roleStyle.color }}>
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* ── Nav items ──────────────────────────────────────── */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              ...styles.navItem,
              background: isActive ? '#1e3a5f' : 'transparent',
              color: isActive ? '#60a5fa' : '#94a3b8',
              borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
            title={collapsed ? label : undefined}
          >
            <span style={styles.navIcon}>{icon}</span>
            {!collapsed && <span style={styles.navLabel}>{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            {!collapsed && <div style={styles.navDivider} />}
            {ADMIN_ITEMS.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  background: isActive ? '#1c1917' : 'transparent',
                  color: isActive ? '#f59e0b' : '#94a3b8',
                  borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                })}
                title={collapsed ? label : undefined}
              >
                <span style={styles.navIcon}>{icon}</span>
                {!collapsed && <span style={styles.navLabel}>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── Logout ─────────────────────────────────────────── */}
      <button
        style={{
          ...styles.logoutBtn,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
        onClick={handleLogout}
        title="Logout"
      >
        <span style={styles.navIcon}>⏻</span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0d1829',
    borderRight: '1px solid #1e293b',
    height: '100vh',
    position: 'sticky',
    top: 0,
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    flexShrink: 0,
    zIndex: 100,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px 16px',
    borderBottom: '1px solid #1e293b',
    minHeight: 70,
  },
  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    fontSize: 24,
    filter: 'drop-shadow(0 0 6px #2563eb)',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 800,
    color: '#f1f5f9',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  collapseBtn: {
    background: 'transparent',
    border: '1px solid #1e293b',
    color: '#475569',
    borderRadius: 6,
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    margin: '8px 12px',
    background: '#131f35',
    borderRadius: 10,
    border: '1px solid #1e293b',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#1e3a5f',
    color: '#60a5fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleTag: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    display: 'inline-block',
    marginTop: 3,
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  navLabel: {},
  navDivider: {
    height: 1,
    background: '#1e293b',
    margin: '8px 4px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid #1e293b',
    color: '#475569',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  },
};
