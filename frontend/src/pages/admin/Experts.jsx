import { useEffect, useState } from 'react';
import { Search, CheckCircle, Trash2, ShieldAlert, Award } from 'lucide-react';
import api from '../../services/api';

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    const res = await api.get('/admin/experts');
    setExperts(res.data);
    setLoading(false);
  };

  const approve = async (id) => {
    await api.patch(`/admin/experts/${id}/approve`);
    fetchExperts();
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to remove this expert?')) return;
    await api.delete(`/admin/experts/${id}`);
    fetchExperts();
  };

  const filtered = experts.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading experts...</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">Expert Management</h1>
          <p className="text-[var(--text-secondary)]">Review, approve, or remove expert profiles.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search experts by name or category..." 
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
                <th className="px-6 py-4">Expert Profile</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] italic">No experts found matching your search.</td></tr>
              )}
              {filtered.map(e => (
                <tr key={e._id} className="hover:bg-[var(--surface-3)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--surface-3)] to-[var(--border)] flex items-center justify-center font-bold text-[var(--text-secondary)]">
                        {e.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{e.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{e.userId?.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium border border-[var(--primary)]/20">
                      <Award size={12} /> {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">{e.experience} yrs</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${e.userId?.isApproved ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20'}`}>
                      {e.userId?.isApproved ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                      {e.userId?.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!e.userId?.isApproved && (
                        <button 
                          onClick={() => approve(e.userId?._id)} 
                          className="flex items-center gap-1 text-xs font-semibold bg-[var(--success)] text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      <button 
                        onClick={() => remove(e.userId?._id)} 
                        className="flex items-center gap-1 text-xs font-semibold bg-[var(--danger)]/10 text-[var(--danger)] px-3 py-1.5 rounded-lg hover:bg-[var(--danger)] hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
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
