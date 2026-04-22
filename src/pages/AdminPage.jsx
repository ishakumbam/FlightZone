import { useState } from 'react';

const USE_MOCK = true;

const mockUsers = [
  { id: 1, employeeId: 'EMP001', name: 'Nataly Castillo',    role: 'admin',      status: 'Active'   },
  { id: 2, employeeId: 'EMP002', name: 'Isha Kumbam',        role: 'dispatcher', status: 'Active'   },
  { id: 3, employeeId: 'EMP003', name: 'Veda Narapureddy',   role: 'pilot',      status: 'Active'   },
  { id: 4, employeeId: 'EMP004', name: 'Yugarya Goyal',      role: 'dispatcher', status: 'Active'   },
  { id: 5, employeeId: 'EMP005', name: 'Klyne Smith',        role: 'pilot',      status: 'Inactive' },
];

const roleBadgeColor = (role) => {
  if (role === 'admin')      return '#C8102E';
  if (role === 'dispatcher') return '#2563EB';
  return '#059669';
};

export default function AdminPage() {
  const [users, setUsers]               = useState(mockUsers);
  const [editingUser, setEditingUser]   = useState(null);
  const [editRole, setEditRole]         = useState('');
  const [showInvite, setShowInvite]     = useState(false);
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [inviteRole, setInviteRole]     = useState('pilot');

  const openEdit = (user) => { setEditingUser(user); setEditRole(user.role); };

  const saveEdit = async () => {
    if (USE_MOCK) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editRole } : u));
    } else {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('fz_token')}` },
        body: JSON.stringify({ role: editRole }),
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editRole } : u));
    }
    setEditingUser(null);
  };

  const saveInvite = async () => {
    if (!inviteEmployeeId.trim()) return;
    const newUser = { id: Date.now(), employeeId: inviteEmployeeId, name: inviteEmployeeId, role: inviteRole, status: 'Active' };
    if (USE_MOCK) {
      setUsers([...users, newUser]);
    } else {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('fz_token')}` },
        body: JSON.stringify({ employeeId: inviteEmployeeId, role: inviteRole }),
      });
      const created = await res.json();
      setUsers([...users, created]);
    }
    setShowInvite(false);
    setInviteEmployeeId('');
    setInviteRole('pilot');
  };

  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalStyle   = { background: '#1e293b', borderRadius: '12px', padding: '28px 32px', width: '360px', boxShadow: '0 4px 32px rgba(0,0,0,0.4)', border: '1px solid #334155' };

  return (
    <div style={{ padding: '24px', background: '#0f172a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: '22px', fontWeight: 700 }}>⚙ User Management</h1>
        <button onClick={() => setShowInvite(true)} style={{ background: '#C8102E', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          + Invite User
        </button>
      </div>

      <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1B2A4A' }}>
              {['Employee ID', 'Name', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#e2e8f0', fontWeight: 600, fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ background: index % 2 === 0 ? '#1e293b' : '#162032', borderBottom: '1px solid #334155' }}>
                <td style={td}>{user.employeeId}</td>
                <td style={td}>{user.name}</td>
                <td style={td}>
                  <span style={{ background: roleBadgeColor(user.role), color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                    {user.role}
                  </span>
                </td>
                <td style={td}>{user.status}</td>
                <td style={td}>
                  <button onClick={() => openEdit(user)} style={{ background: '#1B2A4A', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Edit Role</h2>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748b' }}>Employee</p>
            <p style={{ margin: '0 0 16px', fontWeight: 500, color: '#e2e8f0' }}>{editingUser.name} ({editingUser.employeeId})</p>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Role</label>
            <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', marginBottom: '24px', fontSize: '14px' }}>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="pilot">Pilot</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingUser(null)} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveEdit} style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#1B2A4A', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInvite && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Invite User</h2>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Employee ID</label>
            <input value={inviteEmployeeId} onChange={e => setInviteEmployeeId(e.target.value)} placeholder="e.g. EMP006" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', marginBottom: '24px', fontSize: '14px' }}>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="pilot">Pilot</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInvite(false)} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveInvite} style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#C8102E', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const td = { padding: '12px 16px', color: '#e2e8f0', fontSize: '14px' };
