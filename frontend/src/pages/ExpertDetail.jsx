import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, Star, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const getCategoryGradient = (cat) => {
  const colors = {
    Tech: 'from-blue-400 to-indigo-500',
    Finance: 'from-green-400 to-emerald-500',
    Health: 'from-red-400 to-rose-500',
    Legal: 'from-purple-400 to-fuchsia-500',
    Marketing: 'from-orange-400 to-amber-500'
  };
  return colors[cat] || 'from-gray-400 to-slate-500';
};

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.round(rating)) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    } else {
      stars.push(<Star key={i} size={14} className="text-gray-300 dark:text-gray-600" />);
    }
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState('');
  const [waitlistError, setWaitlistError] = useState('');
  const [flashingSlots, setFlashingSlots] = useState({});

  useEffect(() => {
    let cancelled = false;
    const fetchExpert = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/experts/${id}`);
        if (!cancelled) setExpert(res.data);
      } catch (err) {
        if (!cancelled) setError('Failed to load expert details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchExpert();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.on('slotBooked', ({ expertId, date, timeSlot }) => {
      if (expertId === id) {
        // Trigger flash animation
        const slotKey = `${date}-${timeSlot}`;
        setFlashingSlots(prev => ({ ...prev, [slotKey]: true }));
        
        setTimeout(() => {
          setFlashingSlots(prev => ({ ...prev, [slotKey]: false }));
        }, 1000);

        setExpert(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            availableSlots: prev.availableSlots.map(s =>
              s.date === date && s.time === timeSlot ? { ...s, isBooked: true } : s
            )
          };
        });
      }
    });
    return () => socket.disconnect();
  }, [id]);

  const groupSlotsByDate = () => {
    if (!expert) return {};
    const groups = {};
    for (const slot of expert.availableSlots) {
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    }
    const sortedDates = Object.keys(groups).sort();
    const result = {};
    for (const d of sortedDates) {
      result[d] = groups[d].sort((a, b) => a.time.localeCompare(b.time));
    }
    return result;
  };

  const handleBook = (date, time) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/book/${expert._id}?date=${date}&time=${time}`);
  };

  const joinWaitlist = async (date, timeSlot) => {
    setWaitlistError(''); setWaitlistSuccess('');
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/waitlist', { expertId: id, date, timeSlot });
      setWaitlistSuccess('Added to waitlist!');
    } catch (err) {
      setWaitlistError(err.response?.data?.message || 'Failed to join waitlist.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading expert profile...</p>
    </div>
  );
  if (error) return <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-4 rounded-xl border border-[var(--danger)]/20 mt-6">{error}</div>;
  if (!expert) return <div className="text-center py-12 text-[var(--text-muted)]">Expert not found.</div>;

  const grouped = groupSlotsByDate();
  const allBooked = (slots) => slots.every(s => s.isBooked);

  return (
    <div className="fade-in pb-12">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-6 transition-colors group font-medium">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Experts
      </button>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-10 shadow-lg border border-[var(--border)]">
        <div className={`h-40 md:h-56 bg-gradient-to-r ${getCategoryGradient(expert.category)} opacity-90`}></div>
        
        <div className="bg-[var(--surface)] px-6 md:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 mb-6">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--surface)] flex items-center justify-center text-4xl md:text-5xl font-bold text-white bg-gradient-to-br ${getCategoryGradient(expert.category)} shadow-lg flex-shrink-0`}>
              {getInitials(expert.name)}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">{expert.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-[var(--surface-3)] text-[var(--text-primary)] px-3 py-1 rounded-full text-sm font-semibold border border-[var(--border)]">
                      {expert.category}
                    </span>
                    <span className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
                      <Clock size={16} /> {expert.experience} years experience
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end">
                  <div className="text-3xl font-extrabold text-[var(--accent)]">${expert.hourlyRate}<span className="text-sm text-[var(--text-muted)] font-normal">/hr</span></div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={expert.rating} />
                    <span className="font-bold text-[var(--text-primary)]">{expert.rating}</span>
                    <span className="text-[var(--text-muted)] text-sm">({expert.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">About</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">{expert.bio}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Slots */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar size={24} className="text-[var(--primary)]" />
                Schedule a Session
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium bg-[var(--success)]/10 text-[var(--success)] px-3 py-1.5 rounded-full border border-[var(--success)]/20">
                <div className="pulse-dot"></div>
                Live Availability
              </div>
            </div>

            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-10 bg-[var(--surface-3)] rounded-xl border border-[var(--border)] border-dashed">
                <Calendar size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-primary)] font-medium">No slots currently available.</p>
                <p className="text-sm text-[var(--text-secondary)]">Check back later or message the expert.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([date, slots]) => (
                  <div key={date} className="animate-fadeIn">
                    <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <div className="w-2 h-6 bg-[var(--primary)] rounded-full"></div>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map(slot => {
                        const slotKey = `${slot.date}-${slot.time}`;
                        const isFlashing = flashingSlots[slotKey];
                        
                        return (
                          <button
                            key={slotKey}
                            disabled={slot.isBooked}
                            onClick={() => handleBook(slot.date, slot.time)}
                            className={`relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group
                              ${slot.isBooked
                                ? 'bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed opacity-70'
                                : 'bg-[var(--surface)] text-[var(--primary)] border-2 border-[var(--primary)]/30 hover:border-[var(--primary)] hover:shadow-md hover:-translate-y-1'
                              }
                              ${isFlashing ? 'bg-red-500 border-red-600 text-white animate-pulse' : ''}
                            `}
                          >
                            {slot.isBooked ? (
                              <span className="line-through decoration-2 opacity-60 flex items-center justify-center gap-1">
                                {slot.time}
                              </span>
                            ) : (
                              <span className="flex items-center justify-center relative z-10">
                                {slot.time}
                              </span>
                            )}
                            {!slot.isBooked && (
                              <div className="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {allBooked(slots) && user?.role === 'user' && (
                      <div className="mt-4 flex items-center justify-between bg-[var(--surface-3)] p-3 rounded-xl border border-[var(--border)]">
                        <span className="text-sm text-[var(--text-secondary)]">All slots booked for this date.</span>
                        <button
                          onClick={() => joinWaitlist(date, slots[0].time)}
                          className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] hover:underline flex items-center gap-1"
                        >
                          Join Waitlist
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {waitlistSuccess && (
              <div className="mt-6 bg-[var(--success)]/10 text-[var(--success)] p-4 rounded-xl border border-[var(--success)]/20 flex items-center gap-2 slide-in">
                <CheckCircle2 size={18} /> {waitlistSuccess}
              </div>
            )}
            {waitlistError && (
              <div className="mt-6 bg-[var(--danger)]/10 text-[var(--danger)] p-4 rounded-xl border border-[var(--danger)]/20 flex items-center gap-2 slide-in">
                <AlertCircle size={18} /> {waitlistError}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Reviews */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Client Reviews</h2>
            
            {expert.reviews && expert.reviews.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {expert.reviews.map(r => (
                  <div key={r._id} className="bg-[var(--surface)] rounded-xl shadow-sm border-l-4 border-[var(--accent)] p-4 border-y border-r border-[var(--border)]">
                    <div className="flex items-center gap-1 mb-2">
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="text-[var(--text-primary)] text-sm mb-3 italic">"{r.comment}"</p>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      — {r.userId?.name || 'User'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[var(--surface-3)] rounded-xl border border-[var(--border)] border-dashed">
                <Star size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No reviews yet for this expert.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
