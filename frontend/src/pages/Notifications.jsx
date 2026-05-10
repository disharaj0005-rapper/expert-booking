import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Calendar, User, Clock, AlertCircle, Inbox } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[var(--text-secondary)] font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Bell className="text-[var(--primary)]" size={32} />
            Notifications
          </h1>
          <p className="text-[var(--text-secondary)]">Stay updated with your latest bookings and system alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[var(--surface-3)] p-1 rounded-xl flex">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'all' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'unread' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              Unread
            </button>
          </div>
          
          <button 
            onClick={markAllRead}
            className="px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-colors"
          >
            Mark all read
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-[var(--border)] shadow-sm">
          <div className="w-20 h-20 bg-[var(--surface-3)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="text-[var(--text-muted)]" size={40} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No notifications found</h3>
          <p className="text-[var(--text-secondary)]">When you receive alerts, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((n) => (
            <div 
              key={n._id}
              className={`glass group rounded-2xl p-5 border transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                !n.read 
                  ? 'border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/5 to-transparent' 
                  : 'border-[var(--border)] hover:border-[var(--primary)]/20'
              }`}
            >
              {!n.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)]"></div>}
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                !n.read ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
              }`}>
                {n.type === 'booking' ? <Calendar size={24} /> : 
                 n.type === 'status' ? <Clock size={24} /> : 
                 <AlertCircle size={24} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-lg transition-colors ${!n.read ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {n.message}
                  </h4>
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap ml-4">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                  {n.details || 'No additional details provided.'}
                </p>
                
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button 
                      onClick={() => markRead(n._id)}
                      className="text-xs font-bold text-[var(--primary)] flex items-center gap-1 hover:underline"
                    >
                      <Check size={14} /> Mark as read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n._id)}
                    className="text-xs font-bold text-[var(--danger)] flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
