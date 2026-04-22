import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import mockFlights from '../data/mockFlights';

const USE_MOCK = true;
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_LINE_COLORS = {
  ontime:    '#22c55e',
  delayed:   '#f59e0b',
  cancelled: '#ef4444',
};

function StatusBadge({ status }) {
  const cfg = {
    ontime:    { label: 'On-Time',   bg: '#dcfce7', color: '#166534' },
    delayed:   { label: 'Delayed',   bg: '#fef3c7', color: '#92400e' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b' },
  };
  const s = cfg[status] || { label: status, bg: '#e5e7eb', color: '#374151' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function FlightsPage({ searchQuery = '' }) {
  const [flights, setFlights]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterDate, setFilterDate]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (USE_MOCK) {
      setFlights(mockFlights);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (filterStatus !== 'All') params.set('status', filterStatus);
    if (searchQuery) params.set('search', searchQuery);
    setLoading(true);
    fetch(`${API_BASE}/api/flights?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('fz_token')}` },
    })
      .then(r => r.json())
      .then(data => { setFlights(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setFlights([]); setLoading(false); });
  }, [filterStatus, searchQuery]);

  const filteredFlights = flights.filter(f => {
    const matchStatus = filterStatus === 'All' || f.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || f.flightId.toLowerCase().includes(q) || f.route.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ padding: '24px', background: '#0f172a', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ color: '#f1f5f9', marginBottom: '20px', fontSize: '22px', fontWeight: 700 }}>
        ✈ Flights Dashboard
      </h1>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterDate} onChange={e => setFilterDate(e.target.value)} style={selectStyle}>
          <option value="All">Filter by Date: All</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="All">Filter by Status: All</option>
          <option value="ontime">On-Time</option>
          <option value="delayed">Delayed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '13px', color: '#64748b' }}>
          {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* World Map */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #334155' }}>
        <MapContainer center={[37, -95]} zoom={4} style={{ height: '340px', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredFlights.map(f => (
            <React.Fragment key={f.flightId}>
              <CircleMarker center={[f.originLat, f.originLng]} radius={7} pathOptions={{ color: '#C8102E', fillColor: '#C8102E', fillOpacity: 0.9, weight: 1.5 }}>
                <Popup><strong>{f.flightId}</strong><br />{f.route}<br />Dep: <strong>{f.origin}</strong></Popup>
              </CircleMarker>
              <CircleMarker center={[f.destLat, f.destLng]} radius={6} pathOptions={{ color: '#1B2A4A', fillColor: '#1B2A4A', fillOpacity: 0.85, weight: 1.5 }}>
                <Popup><strong>{f.flightId}</strong><br />{f.route}<br />Arr: <strong>{f.dest}</strong></Popup>
              </CircleMarker>
              <Polyline
                positions={[[f.originLat, f.originLng], [f.destLat, f.destLng]]}
                pathOptions={{ color: STATUS_LINE_COLORS[f.status] || '#6b7280', weight: 2, opacity: 0.65, dashArray: f.status === 'cancelled' ? '6 4' : null }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '12px', color: '#94a3b8' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#C8102E', marginRight: 5 }} />Origin</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#1B2A4A', marginRight: 5 }} />Destination</span>
        <span><span style={{ display: 'inline-block', width: 20, height: 3, background: '#22c55e', marginRight: 5, verticalAlign: 'middle' }} />On-Time</span>
        <span><span style={{ display: 'inline-block', width: 20, height: 3, background: '#f59e0b', marginRight: 5, verticalAlign: 'middle' }} />Delayed</span>
        <span><span style={{ display: 'inline-block', width: 20, height: 3, background: '#ef4444', marginRight: 5, verticalAlign: 'middle' }} />Cancelled</span>
      </div>

      {/* Flights table */}
      <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>
            Flights List Recommendations
          </h2>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading flights...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['Flight', 'Route', 'Status', 'Weather', 'Fuel (lbs)'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFlights.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No flights match the current filters.</td></tr>
                ) : (
                  filteredFlights.map((f, i) => (
                    <tr key={f.flightId} style={{ background: i % 2 === 0 ? '#1e293b' : '#162032', borderBottom: '1px solid #334155' }}>
                      <td style={tdStyle}><strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{f.flightId}</strong></td>
                      <td style={tdStyle}>{f.route}</td>
                      <td style={tdStyle}><StatusBadge status={f.status} /></td>
                      <td style={tdStyle}>{f.weather}</td>
                      <td style={tdStyle}>{f.fuel_pred.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const selectStyle = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155',
  background: '#1e293b', fontSize: '14px', cursor: 'pointer', color: '#f1f5f9',
};
const thStyle = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#94a3b8',
  borderBottom: '1px solid #334155', fontSize: '13px', whiteSpace: 'nowrap',
};
const tdStyle = { padding: '10px 16px', color: '#e2e8f0', borderBottom: '1px solid #1e293b' };
