const mockAlerts = [
  { id: 1, severity: 'HIGH', message: 'Engine anomaly detected on Flight AA302', timestamp: '2026-04-14 08:32', flightId: 'AA302', is_read: false },
  { id: 2, severity: 'HIGH', message: 'Severe turbulence reported on DFW to LAX route', timestamp: '2026-04-14 09:15', flightId: 'AA471', is_read: false },
  { id: 3, severity: 'MEDIUM', message: 'Departure delay of 45 minutes for Flight AA110', timestamp: '2026-04-14 09:45', flightId: 'AA110', is_read: false },
  { id: 4, severity: 'MEDIUM', message: 'Weather advisory issued for Chicago O\'Hare arrivals', timestamp: '2026-04-14 10:00', flightId: 'AA885', is_read: false },
  { id: 5, severity: 'MEDIUM', message: 'Fuel load adjustment required for Flight AA203', timestamp: '2026-04-14 10:22', flightId: 'AA203', is_read: false },
  { id: 6, severity: 'LOW', message: 'Routine maintenance check due for Flight AA657', timestamp: '2026-04-14 10:55', flightId: 'AA657', is_read: false },
  { id: 7, severity: 'LOW', message: 'Minor schedule shift on AA900 — 10 minute delay', timestamp: '2026-04-14 11:10', flightId: 'AA900', is_read: false },
  { id: 8, severity: 'LOW', message: 'Passenger count update submitted for AA344', timestamp: '2026-04-14 11:30', flightId: 'AA344', is_read: false },
];

export default mockAlerts;