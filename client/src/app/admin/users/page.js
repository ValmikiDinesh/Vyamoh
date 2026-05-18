'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users?limit=50');
        setUsers(data.users || []);
      } catch {} finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Users</h1>
      <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field mb-6 max-w-md" />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="p-4 text-left font-medium">User</th><th className="p-4 text-left font-medium">Role</th>
                <th className="p-4 text-left font-medium">Risk</th><th className="p-4 text-left font-medium">Joined</th>
              </tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="p-4">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                    </td>
                    <td className="p-4"><span className={`badge ${u.role === 'admin' || u.role === 'superadmin' ? 'badge-brand' : 'badge-info'}`}>{u.role}</span></td>
                    <td className="p-4"><span className={`badge ${u.riskScore > 60 ? 'badge-danger' : u.riskScore > 30 ? 'badge-warning' : 'badge-success'}`}>{u.riskScore || 0}</span></td>
                    <td className="p-4" style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
