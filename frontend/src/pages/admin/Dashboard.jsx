import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, Calendar, Activity, BarChart3, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading admin statistics...</p>
    </div>
  );
  
  if (!stats) return <div className="text-center py-12 text-[var(--danger)] bg-[var(--danger)]/10 rounded-xl">Failed to load admin stats.</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Approved Experts', value: stats.approvedExperts, icon: UserCheck, color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10' },
    { label: 'Pending Experts', value: stats.pendingExperts, icon: Clock, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/10' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Bookings Today', value: stats.bookingsToday, icon: Activity, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' },
  ];

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">Admin Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-6 border border-[var(--border)] shadow-sm card-hover flex flex-col" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                <s.icon size={24} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[var(--text-primary)] mb-1">{s.value}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm h-full">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">System Health</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[var(--text-primary)]">Expert Approval Rate</span>
                <span className="text-[var(--text-secondary)]">
                  {stats.approvedExperts + stats.pendingExperts > 0 
                    ? Math.round((stats.approvedExperts / (stats.approvedExperts + stats.pendingExperts)) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-[var(--surface-3)] rounded-full h-2">
                <div 
                  className="bg-[var(--success)] h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${stats.approvedExperts + stats.pendingExperts > 0 ? (stats.approvedExperts / (stats.approvedExperts + stats.pendingExperts)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-[var(--surface-3)] p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-[var(--primary)] mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Quick Actions</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Use the navigation menu to review the {stats.pendingExperts} pending expert applications or manage existing users.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
