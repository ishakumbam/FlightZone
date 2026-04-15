import { useState } from 'react';

const USE_MOCK = true;

const mockUsers = [
  { id: 1, employeeId: 'EMP001', name: 'Nataly Castillo', role: 'admin', status: 'Active' },
  { id: 2, employeeId: 'EMP002', name: 'Isha Kumbam', role: 'dispatcher', status: 'Active' },
  { id: 3, employeeId: 'EMP003', name: 'Veda Narapureddy', role: 'pilot', status: 'Active' },
  { id: 4, employeeId: 'EMP004', name: 'Yugarya Goyal', role: 'dispatcher', status: 'Active' },
  { id: 5, employeeId: 'EMP005', name: 'Klyne Smith', role: 'pilot', status: 'Inactive' },
];

const roleBadgeColor = (role) => {
  if (role === 'admin') return '#C8102E';
  if (role === 'dispatcher') return '#2563EB';
  return '#059669';
};

function AdminPage() {
  const [users, setUsers] = useState(mockUsers);

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [inviteRole, setInviteRole] = useState('pilot');

  // --- Edit handlers ---
  const openEdit = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
  };

  const saveEdit = async () => {
    if (USE_MOCK) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editRole } : u));
    } else {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ role: editRole }),
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editRole } : u));
    }
    setEditingUser(null);
  };

  // --- Invite handlers ---
  const saveInvite = async () => {
    if (!inviteEmployeeId.trim()) return;
    const newUser = { id: Date.now(), employeeId: inviteEmployeeId, name: inviteEmployeeId, role: inviteRole, status: 'Active' };
    if (USE_MOCK) {
      setUsers([...users, newUser]);
    } else {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ employeeId: inviteEmployeeId, role: inviteRole }),
      });
      const created = await res.json();
      setUsers([...users, created]);
    }
    setShowInvite(false);
    setInviteEmployeeId('');
    setInviteRole('pilot');
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };
  const modalStyle = {
    background: 'white', borderRadius: '8px', padding: '28px 32px',
    width: '360px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1B2A4A', margin: 0 }}>User Management</h1>
        <button
          onClick={() => setShowInvite(true)}
          style={{ background: '#C8102E', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
        >
          + Invite User
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#1B2A4A', color: 'white' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Employee ID</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} style={{ background: index % 2 === 0 ? '#F9FAFB' : 'white', borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '12px 16px' }}>{user.employeeId}</td>
              <td style={{ padding: '12px 16px' }}>{user.name}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ background: roleBadgeColor(user.role), color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
                  {user.role}
                </span>
              </td>
              <td style={{ padding: '12px 16px' }}>{user.status}</td>
              <td style={{ padding: '12px 16px' }}>
                <button
                  onClick={() => openEdit(user)}
                  style={{ background: '#1B2A4A', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Role Modal */}
      {editingUser && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: '#1B2A4A', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Edit Role</h2>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6B7280' }}>Employee</p>
            <p style={{ margin: '0 0 16px', fontWeight: 500 }}>{editingUser.name} ({editingUser.employeeId})</p>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Role</label>
            <select
              value={editRole}
              onChange={e => setEditRole(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', marginBottom: '24px', fontSize: '14px' }}
            >
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="pilot">Pilot</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingUser(null)} style={{ padding: '8px 18px', borderRadius: '4px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveEdit} style={{ padding: '8px 18px', borderRadius: '4px', border: 'none', background: '#1B2A4A', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInvite && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ color: '#1B2A4A', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Invite User</h2>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Employee ID</label>
            <input
              value={inviteEmployeeId}
              onChange={e => setInviteEmployeeId(e.target.value)}
              placeholder="e.g. EMP006"
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', marginBottom: '16px', fontSize: '14px', boxSizing: 'border-box' }}
            />
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Role</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', marginBottom: '24px', fontSize: '14px' }}
            >
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="pilot">Pilot</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInvite(false)} style={{ padding: '8px 18px', borderRadius: '4px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveInvite} style={{ padding: '8px 18px', borderRadius: '4px', border: 'none', background: '#C8102E', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;