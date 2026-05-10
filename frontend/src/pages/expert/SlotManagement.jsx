import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Repeat, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function SlotManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const pid = res.data.expertProfile?._id;
      if (pid) api.get(`/experts/${pid}`).then(r => {
        setSlots(r.data.availableSlots || []);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Date and time are required');
      return;
    }
    setError('');
    setAdding(true);
    try {
      await api.post('/experts/slots', { date, time, repeatWeekly });
      const me = await api.get('/auth/me');
      const r = await api.get(`/experts/${me.data.expertProfile._id}`);
      setSlots(r.data.availableSlots);
      setDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setAdding(false);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      await api.delete(`/experts/slots/${slotId}`);
      setSlots(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  const groupByDate = () => {
    const g = {};
    slots.forEach(s => {
      if (!g[s.date]) g[s.date] = [];
      g[s.date].push(s);
    });
    return g;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading slots...</p>
    </div>
  );

  const grouped = groupByDate();
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="fade-in pb-12">
      <button onClick={() => navigate('/expert/dashboard')} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-6 transition-colors group font-medium">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">Manage Slots</h1>
        <p className="text-[var(--text-secondary)]">Set your availability for clients to book sessions.</p>
      </div>

      {error && (
        <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-4 rounded-xl border border-[var(--danger)]/20 flex items-center gap-2 mb-6">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form onSubmit={addSlot} className="glass rounded-2xl shadow-sm p-6 mb-10 border border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <Calendar size={18} className="text-[var(--primary)]" /> Add Availability
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 relative">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Date</label>
            <div className="relative">
              <input 
                type="date" 
                required 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="input-glow w-full px-4 py-3 rounded-xl focus:ring-0 text-[var(--text-primary)] bg-[var(--surface-3)] border-[var(--border)]" 
              />
            </div>
          </div>
          
          <div className="md:col-span-3 relative">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Time</label>
            <div className="relative">
              <input 
                type="time" 
                required 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="input-glow w-full px-4 py-3 rounded-xl focus:ring-0 text-[var(--text-primary)] bg-[var(--surface-3)] border-[var(--border)]" 
              />
            </div>
          </div>
          
          <div className="md:col-span-3 flex items-center h-[52px]">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={repeatWeekly} 
                  onChange={e => setRepeatWeekly(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </div>
              <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1.5 group-hover:text-[var(--text-primary)] transition-colors">
                <Repeat size={14} /> Repeat 4 weeks
              </span>
            </label>
          </div>
          
          <div className="md:col-span-2">
            <button 
              type="submit" 
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5 font-medium disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {adding ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus size={18} /> Add</>}
            </button>
          </div>
        </div>
      </form>

      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <Clock className="text-[var(--primary)]" size={20} /> Current Slots
      </h2>
      
      {sortedDates.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-[var(--surface-3)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-[var(--text-muted)]" size={24} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No slots available</h3>
          <p className="text-[var(--text-secondary)]">Add some availability using the form above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(d => (
            <div key={d} className="glass rounded-2xl shadow-sm p-6 border border-[var(--border)] animate-fadeIn">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[var(--primary)] rounded-full"></div>
                {new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {grouped[d].sort((a,b) => a.time.localeCompare(b.time)).map(s => (
                  <div 
                    key={s._id} 
                    className={`group relative flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      s.isBooked 
                        ? 'bg-[var(--surface-3)] text-[var(--text-muted)] border-[var(--border)] cursor-default' 
                        : 'bg-[var(--surface)] text-[var(--text-primary)] border-[var(--primary)]/30 hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className={s.isBooked ? 'opacity-50' : 'text-[var(--primary)]'} /> 
                      {s.time}
                    </span>
                    
                    {s.isBooked ? (
                      <span className="text-[10px] bg-[var(--warning)]/10 text-[var(--warning)] px-2 py-0.5 rounded uppercase tracking-wider">Booked</span>
                    ) : (
                      <button 
                        onClick={() => deleteSlot(s._id)} 
                        className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100 p-1 bg-[var(--danger)]/10 rounded-md"
                        title="Delete slot"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
