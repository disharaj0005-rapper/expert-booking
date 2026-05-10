import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, TrendingUp, Users, Check, X } from 'lucide-react';
import api from '../../services/api';

const statusStyles = {
  pending: 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20',
  confirmed: 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20',
  completed: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
  cancelled: 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
};

export default function ExpertDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/experts/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status`, { status });
    setData(prev => ({
      ...prev,
      stats: { ...prev.stats, [status]: prev.stats[status] + (status === 'pending' ? -1 : 1), pending: status === 'confirmed' ? prev.stats.pending - 1 : prev.stats.pending },
      upcoming: prev.upcoming.map(b => b._id === id ? { ...b, status } : b)
    }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading dashboard...</p>
    </div>
  );
  
  if (!data) return <div className="text-center py-12 text-[var(--danger)] bg-[var(--danger)]/10 rounded-xl">Failed to load dashboard data.</div>;

  const { stats, upcoming } = data;

  const statCards = [
    { label: 'Total Sessions', value: stats.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/10' },
    { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10' },
    { label: 'Completed Today', value: stats.completedToday, icon: TrendingUp, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' }
  ];

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Expert Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Overview of your bookings and session performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-6 border border-[var(--border)] shadow-sm card-hover flex items-center justify-between" style={{ animationDelay: `${i * 0.1}s` }}>
            <div>
              <div className="text-3xl font-extrabold text-[var(--text-primary)] mb-1">{s.value}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)]">{s.label}</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Calendar className="text-[var(--primary)]" size={20} /> Upcoming Bookings
        </h2>
      </div>

      <div className="glass rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--surface-3)] text-[var(--text-secondary)] uppercase text-xs font-bold tracking-wider border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {upcoming.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] italic">No upcoming bookings at the moment.</td></tr>
              )}
              {upcoming.map(b => (
                <tr key={b._id} className="hover:bg-[var(--surface-3)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{b.userId?.name || b.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{b.userId?.email || b.email || 'No email provided'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">{b.date}</td>
                  <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">{b.timeSlot}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusStyles[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {b.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(b._id, 'confirmed')} 
                          className="flex items-center gap-1 text-xs font-semibold bg-[var(--success)] text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <Check size={14} /> Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button 
                          onClick={() => updateStatus(b._id, 'completed')} 
                          className="flex items-center gap-1 text-xs font-semibold bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--primary-dark)] transition-colors shadow-sm"
                        >
                          <CheckCircle2 size={14} /> Complete
                        </button>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button 
                          onClick={() => updateStatus(b._id, 'cancelled')} 
                          className="flex items-center gap-1 text-xs font-semibold bg-[var(--danger)]/10 text-[var(--danger)] px-3 py-1.5 rounded-lg hover:bg-[var(--danger)] hover:text-white transition-colors"
                        >
                          <X size={14} />
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
