import { useState, useEffect } from 'react';
import mockAlerts from '../data/mockAlerts';

const USE_MOCK = true;

const mockSystemAlerts = [
  { id: 's1', type: 'error',   message: 'Optimization engine timeout',                    ts: '2026-04-22 09:12' },
  { id: 's2', type: 'warning', message: 'Aviationstack API response slow (>3s)',           ts: '2026-04-22 08:45' },
  { id: 's3', type: 'info',    message: 'Backend connectivity restored',                   ts: '2026-04-22 07:30' },
];

export default function AlertsPage({ onUnreadCount }) {
  const [alerts, setAlerts]     = useState(mockAlerts);
  const [activeTab, setActiveTab] = useState('flight');
  const [systemAlerts]          = useState(mockSystemAlerts);

  useEffect(() => {
    if (onUnreadCount) onUnreadCount(alerts.filter(a => !a.is_read).length);
  }, []);

  const markAsRead = (id) => {
    const updated = alerts.map(alert => alert.id === id ? { ...alert, is_read: true } : alert);
    setAlerts(updated);
    if (onUnreadCount) onUnreadCount(updated.filter(a => !a.is_read).length);
  };

  const getBorderColor = (severity) => {
    if (severity === 'HIGH')   return '4px solid #C8102E';
    if (severity === 'MEDIUM') return '4px solid #D97706';
    return '4px solid #2563EB';
  };

  const getBadgeColor = (severity) => {
    if (severity === 'HIGH')   return '#C8102E';
    if (severity === 'MEDIUM') return '#D97706';
    return '#2563EB';
  };

  const getSystemIcon = (type) => {
    if (type === 'error')   return { color: '#C8102E', label: 'ERROR' };
    if (type === 'warning') return { color: '#D97706', label: 'WARN' };
    return { color: '#2563EB', label: 'INFO' };
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const tabStyle = (tab) => ({
    padding: '8px 20px', border: 'none',
    borderBottom: activeTab === tab ? '3px solid #C8102E' : '3px solid transparent',
    background: 'none', cursor: 'pointer',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#C8102E' : '#64748b',
    fontSize: '14px',
  });

  return (
    <div style={{ padding: '24px', background: '#0f172a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: '22px', fontWeight: 700 }}>🔔 Alerts & Issues</h1>
        {unreadCount > 0 && (
          <span style={{ background: '#C8102E', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '13px', fontWeight: 600 }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      <div style={{ borderBottom: '1px solid #334155', marginBottom: '20px', display: 'flex' }}>
        <button style={tabStyle('flight')} onClick={() => setActiveTab('flight')}>
          Flight Alerts {unreadCount > 0 && activeTab !== 'flight' ? `(${unreadCount})` : ''}
        </button>
        <button style={tabStyle('system')} onClick={() => setActiveTab('system')}>System Alerts</button>
      </div>

      {activeTab === 'flight' && alerts.map(alert => (
        <div key={alert.id} style={{
          borderLeft: getBorderColor(alert.severity),
          background: alert.is_read ? '#1e293b' : '#162032',
          padding: '16px', marginBottom: '12px', borderRadius: '8px',
          border: '1px solid #334155',
          opacity: alert.is_read ? 0.6 : 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: getBadgeColor(alert.severity), color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              {alert.severity}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{alert.timestamp}</span>
          </div>
          <p style={{ margin: '8px 0', color: '#e2e8f0' }}>{alert.message}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Flight: {alert.flightId}</span>
            {!alert.is_read ? (
              <button onClick={() => markAsRead(alert.id)} style={{ background: '#1B2A4A', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                Mark as Read
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: '#64748b' }}>✓ Read</span>
            )}
          </div>
        </div>
      ))}

      {activeTab === 'system' && systemAlerts.map(sa => {
        const { color, label } = getSystemIcon(sa.type);
        return (
          <div key={sa.id} style={{ borderLeft: `4px solid ${color}`, background: '#1e293b', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: color, color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{label}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{sa.ts}</span>
            </div>
            <p style={{ margin: '8px 0', color: '#e2e8f0' }}>{sa.message}</p>
          </div>
        );
      })}
    </div>
  );
}
