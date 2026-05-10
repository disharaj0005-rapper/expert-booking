import { useEffect, useState } from 'react';
import { Search, Trash2, Mail, CalendarDays, Shield, User } from 'lucide-react';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(res => { setUsers(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading users...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">User Management</h1>
          <p className="text-[var(--text-secondary)]">View and manage all registered accounts.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="input-glow w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0" 
          />
        </div>
      </div>

      <div className="glass rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--surface-3)] text-[var(--text-secondary)] uppercase text-xs font-bold tracking-wider border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-[var(--text-muted)] italic">No users found matching your search.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-[var(--surface-3)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--surface-3)] to-[var(--border)] flex items-center justify-center font-bold text-[var(--text-secondary)]">
                        {u.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{u.name}</div>
                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : u.role === 'expert' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[var(--text-muted)]" />
                      {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => remove(u._id)} 
                          className="flex items-center gap-1 text-xs font-semibold bg-[var(--danger)]/10 text-[var(--danger)] px-3 py-1.5 rounded-lg hover:bg-[var(--danger)] hover:text-white transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
