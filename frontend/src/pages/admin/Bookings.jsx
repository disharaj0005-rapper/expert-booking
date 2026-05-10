import { useEffect, useState } from 'react';
import { Filter, Calendar, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const statusStyles = {
  pending: 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20',
  confirmed: 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20',
  completed: 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20',
  cancelled: 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    try {
      const res = await api.get('/admin/bookings', { params });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">Platform Bookings</h1>
          <p className="text-[var(--text-secondary)]">Monitor and manage all sessions across the platform.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="input-glow w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0 appearance-none font-medium cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[var(--text-secondary)] font-medium">Loading bookings...</p>
        </div>
      ) : (
        <div className="glass rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--surface-3)] text-[var(--text-secondary)] uppercase text-xs font-bold tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Expert</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-[var(--text-muted)]">
                      <div className="w-16 h-16 bg-[var(--surface-3)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-[var(--text-muted)]" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">No bookings found</h3>
                      <p className="text-[var(--text-secondary)]">Try changing your filters.</p>
                    </td>
                  </tr>
                )}
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-[var(--surface-3)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--text-primary)]">{b.userId?.name || b.name}</div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <User size={10} /> {b.userId?.email || b.email || 'Guest'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 flex items-center justify-center font-bold text-[var(--primary)] text-xs">
                          {getInitials(b.expertId?.name)}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{b.expertId?.name || 'Expert'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-[var(--text-secondary)] font-medium">
                        <div className="flex items-center gap-1.5"><Calendar size={14} /> {b.date}</div>
                        <div className="flex items-center gap-1.5"><Clock size={14} /> {b.timeSlot}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusStyles[b.status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status !== 'completed' && b.status !== 'cancelled' ? (
                        <div className="relative inline-block">
                          <select 
                            value={b.status} 
                            onChange={e => updateStatus(b._id, e.target.value)} 
                            className="appearance-none text-xs font-semibold border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary)]/50 focus:ring-0 focus:border-[var(--primary)] cursor-pointer pr-7 transition-colors"
                          >
                            <option value="pending">Set Pending</option>
                            <option value="confirmed">Set Confirmed</option>
                            <option value="completed">Set Completed</option>
                            <option value="cancelled">Set Cancelled</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-muted)]">
                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] font-medium italic">
                          {b.status === 'completed' ? 'Session Finished' : 'Session Cancelled'}
                        </span>
                      )}
                    </td>
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
