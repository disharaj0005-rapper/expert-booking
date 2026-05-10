import { useEffect, useState } from 'react';
import { Calendar, Clock, X, CalendarClock, Star, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  pending: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
  confirmed: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
  completed: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
  cancelled: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
};

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EX';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [slots, setSlots] = useState([]);

  const fetchBookings = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings', { params: { email: user.email } });
      setBookings(res.data);
    } catch (err) {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const openReschedule = async (b) => {
    const res = await api.get(`/experts/${b.expertId?._id || b.expertId}`);
    setSlots(res.data.availableSlots.filter(s => !s.isBooked));
    setRescheduleModal({ ...b, newDate: '', newTime: '' });
  };

  const confirmReschedule = async () => {
    if (!rescheduleModal.newDate || !rescheduleModal.newTime) {
      alert('Please select a new date and time.');
      return;
    }
    try {
      await api.patch(`/bookings/${rescheduleModal._id}/reschedule`, {
        date: rescheduleModal.newDate,
        timeSlot: rescheduleModal.newTime
      });
      setRescheduleModal(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      alert('Please provide a comment for your review.');
      return;
    }
    try {
      await api.post('/reviews', {
        expertId: reviewModal.expertId?._id || reviewModal.expertId,
        bookingId: reviewModal._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading your bookings...</p>
    </div>
  );

  return (
    <div className="fade-in py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">My Bookings</h1>
          <p className="text-[var(--text-secondary)]">Manage your upcoming and past expert sessions.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-4 rounded-xl border border-[var(--danger)]/20 flex items-center gap-2 mb-8">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {bookings.length === 0 && !error && (
        <div className="text-center py-20 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm">
          <div className="w-20 h-20 bg-[var(--surface-3)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-[var(--text-muted)]" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No bookings found</h3>
          <p className="text-[var(--text-secondary)]">You haven't scheduled any expert sessions yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(b => {
          const expertName = b.expertId?.name || 'Expert';
          return (
            <div key={b._id} className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 card-hover flex flex-col relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                b.status === 'confirmed' ? 'bg-[var(--success)]' : 
                b.status === 'pending' ? 'bg-[var(--warning)]' : 
                b.status === 'cancelled' ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'
              }`}></div>
              
              <div className="flex justify-between items-start mb-5 pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--surface-3)] to-[var(--border)] flex items-center justify-center font-bold text-[var(--text-secondary)] flex-shrink-0">
                    {getInitials(expertName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] leading-tight">{expertName}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Booked {new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${statusStyles[b.status] || 'bg-gray-100 text-gray-600'}`}>
                  {b.status}
                </span>
              </div>
              
              <div className="bg-[var(--surface-3)] rounded-xl p-4 mb-5 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={16} className="text-[var(--primary)]" />
                  <span className="font-medium text-[var(--text-primary)]">{b.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[var(--accent)]" />
                  <span className="font-medium text-[var(--text-primary)]">{b.timeSlot}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-[var(--border)] flex flex-wrap gap-2 justify-end">
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button 
                    onClick={() => cancelBooking(b._id)} 
                    className="flex items-center gap-1.5 text-xs font-semibold bg-[var(--surface-3)] text-[var(--danger)] px-3 py-2 rounded-lg hover:bg-[var(--danger)]/10 transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
                
                {b.status === 'pending' && (
                  <button 
                    onClick={() => openReschedule(b)} 
                    className="flex items-center gap-1.5 text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-2 rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors"
                  >
                    <CalendarClock size={14} /> Reschedule
                  </button>
                )}
                
                {b.status === 'completed' && !b.hasReview && (
                  <button 
                    onClick={() => setReviewModal(b)} 
                    className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all hover:scale-105"
                  >
                    <Star size={14} className="fill-white" /> Write Review
                  </button>
                )}

                {b.status === 'completed' && b.hasReview && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--success)] px-3 py-2 bg-[var(--success)]/10 rounded-lg">
                    <CheckCircle2 size={14} /> Reviewed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-[var(--border)] slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-[var(--text-primary)]">Reschedule Session</h3>
              <button onClick={() => setRescheduleModal(null)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"><X size={24} /></button>
            </div>
            
            <div className="bg-[var(--primary)]/10 text-[var(--primary)] p-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold shadow-sm">
                {getInitials(rescheduleModal.expertId?.name)}
              </div>
              <div>
                <p className="font-semibold">{rescheduleModal.expertId?.name}</p>
                <p className="text-xs opacity-80">Select a new date and time below</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Available Slots</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {slots.length === 0 ? (
                  <div className="text-center py-6 bg-[var(--surface-3)] rounded-xl border border-[var(--border)] border-dashed">
                    <p className="text-[var(--text-secondary)] text-sm">No available slots found for this expert.</p>
                  </div>
                ) : (
                  slots.map(s => (
                    <label 
                      key={`${s.date}-${s.time}`} 
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                        rescheduleModal.newDate === s.date && rescheduleModal.newTime === s.time
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="reschedule"
                          className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                          checked={rescheduleModal.newDate === s.date && rescheduleModal.newTime === s.time}
                          onChange={() => setRescheduleModal({ ...rescheduleModal, newDate: s.date, newTime: s.time })}
                        />
                        <span className="font-medium text-[var(--text-primary)]">{s.date}</span>
                      </div>
                      <span className="text-sm font-semibold bg-[var(--surface-3)] px-2 py-1 rounded text-[var(--text-secondary)]">{s.time}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setRescheduleModal(null)} className="flex-1 py-3 bg-[var(--surface-3)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--border)] transition-colors font-medium">
                Cancel
              </button>
              <button 
                onClick={confirmReschedule} 
                disabled={slots.length === 0}
                className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors font-medium shadow-md shadow-[var(--primary)]/20 disabled:opacity-50"
              >
                Confirm New Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-[var(--border)] slide-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xl text-[var(--text-primary)]">Leave a Review</h3>
              <button onClick={() => setReviewModal(null)} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"><X size={24} /></button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">How was your session with {reviewModal.expertId?.name}?</p>
            
            <div className="mb-6 bg-[var(--surface-3)] p-4 rounded-xl">
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3 text-center">Rate your experience</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      className={star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--border)]"} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6 relative">
              <FileText className="absolute left-3 top-3 text-[var(--text-muted)]" size={18} />
              <textarea 
                rows={4} 
                value={reviewForm.comment} 
                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                placeholder="Share details of your experience..."
                className="input-glow w-full pl-10 pr-4 pt-3 pb-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] bg-transparent resize-none" 
              />
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-3 bg-[var(--surface-3)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--border)] transition-colors font-medium">
                Cancel
              </button>
              <button onClick={submitReview} className="flex-1 py-3 bg-gradient-to-r from-[var(--success)] to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] font-medium">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
