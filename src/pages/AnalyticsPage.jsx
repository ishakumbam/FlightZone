import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const routePerfData = [
  { route: 'DFW→LAX', ontime: 89 }, { route: 'JFK→MIA', ontime: 76 }, { route: 'ORD→DFW', ontime: 92 },
  { route: 'LAX→SFO', ontime: 85 }, { route: 'MIA→ATL', ontime: 71 }, { route: 'SEA→DEN', ontime: 88 },
  { route: 'BOS→IAD', ontime: 94 }, { route: 'PHX→LAS', ontime: 97 }, { route: 'DTW→CLT', ontime: 83 },
  { route: 'SFO→PDX', ontime: 79 },
];

const fuelData = [
  { month: 'Feb', predicted: 17800, actual: 18250 },
  { month: 'Mar', predicted: 18100, actual: 17920 },
  { month: 'Apr', predicted: 18400, actual: 18740 },
];

const weatherImpactData = [
  { route: 'DFW → LAX', low: '87%', medium: '64%', high: '28%' },
  { route: 'JFK → MIA', low: '82%', medium: '59%', high: '21%' },
  { route: 'ORD → DFW', low: '91%', medium: '70%', high: '35%' },
  { route: 'LAX → SFO', low: '95%', medium: '80%', high: '52%' },
  { route: 'MIA → ATL', low: '79%', medium: '55%', high: '18%' },
  { route: 'SEA → DEN', low: '88%', medium: '66%', high: '31%' },
];

const histCompData = [
  { metric: 'On-Time %',      lastMonth: 82, thisMonth: 87 },
  { metric: 'Avg Fuel (k)',   lastMonth: 16.4, thisMonth: 15.9 },
  { metric: 'Avg Delay (min)',lastMonth: 18,  thisMonth: 12  },
  { metric: 'Cancellations',  lastMonth: 7,   thisMonth: 4   },
];

const AA_RED   = '#C8102E';
const AA_NAVY  = '#1B2A4A';
const AA_BLUE  = '#2563EB';

function SectionCard({ title, children }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', marginBottom: '28px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #334155' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h2>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function RiskCell({ value, level }) {
  const bg    = { low: '#064e3b', medium: '#451a03', high: '#450a0a' }[level];
  const color = { low: '#34d399', medium: '#f59e0b', high: '#f87171' }[level];
  return (
    <td style={{ padding: '10px 16px', background: bg, color, fontWeight: 600, fontSize: '13px', border: '1px solid #334155' }}>
      {value}
    </td>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ padding: '24px', background: '#0f172a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <h1 style={{ color: '#f1f5f9', marginBottom: '24px', fontSize: '22px', fontWeight: 700 }}>📊 Analytics</h1>

      {/* 1 — Route Performance */}
      <SectionCard title="Route Performance — On-Time %">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={routePerfData} margin={{ top: 4, right: 20, bottom: 40, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
            <YAxis domain={[50, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={v => [`${v}%`, 'On-Time Rate']} contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
            <Bar dataKey="ontime" name="On-Time %" fill={AA_NAVY} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* 2 — Fuel Efficiency */}
      <SectionCard title="Fuel Efficiency — Predicted vs Actual (lbs)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={fuelData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[17000, 19500]} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={v => [`${v.toLocaleString()} lbs`]} contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            <Line type="monotone" dataKey="predicted" name="Predicted" stroke={AA_NAVY} strokeWidth={2.5} dot={{ r: 5, fill: AA_NAVY }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="actual"    name="Actual"    stroke={AA_RED}  strokeWidth={2.5} dot={{ r: 5, fill: AA_RED  }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>FR13 — Fuel burn calculation across key routes over 3 months</p>
      </SectionCard>

      {/* 3 — Weather Impact */}
      <SectionCard title="Weather Impact — On-Time Rate by Condition">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, background: '#0f172a',  color: '#94a3b8' }}>Route</th>
                <th style={{ ...thStyle, background: '#064e3b', color: '#34d399' }}>Low Risk</th>
                <th style={{ ...thStyle, background: '#451a03', color: '#f59e0b' }}>Medium Risk</th>
                <th style={{ ...thStyle, background: '#450a0a', color: '#f87171' }}>High Risk</th>
              </tr>
            </thead>
            <tbody>
              {weatherImpactData.map((row, i) => (
                <tr key={row.route} style={{ background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500, color: '#e2e8f0', border: '1px solid #334155' }}>{row.route}</td>
                  <RiskCell value={row.low}    level="low" />
                  <RiskCell value={row.medium} level="medium" />
                  <RiskCell value={row.high}   level="high" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>User Story 3 — High-risk weather areas highlighted in red</p>
      </SectionCard>

      {/* 4 — Historical Comparisons */}
      <SectionCard title="Historical Comparisons — This Month vs Last Month">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={histCompData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            <Bar dataKey="lastMonth" name="Last Month" fill={AA_BLUE} radius={[3, 3, 0, 0]} />
            <Bar dataKey="thisMonth" name="This Month" fill={AA_RED}  radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

const thStyle = { padding: '10px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #334155', fontSize: '13px' };
