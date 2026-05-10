import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Calendar, Clock, User as UserIcon, Phone, Mail, FileText, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingPage() {
  const { expertId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialDate = searchParams.get('date') || '';
  const initialTime = searchParams.get('time') || '';

  const [expert, setExpert] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(initialDate);
  const [timeSlot, setTimeSlot] = useState(initialTime);
  const [notes, setNotes] = useState('');
  
  const [step, setStep] = useState(1); // 1: Info, 2: Date/Time, 3: Confirm
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [conflictError, setConflictError] = useState('');

  useEffect(() => {
    api.get(`/experts/${expertId}`).then(res => setExpert(res.data)).catch(() => {});
  }, [expertId]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const availableTimesForDate = useMemo(() => {
    if (!expert || !date) return [];
    return expert.availableSlots
      .filter(s => s.date === date && !s.isBooked)
      .map(s => s.time)
      .sort();
  }, [expert, date]);

  useEffect(() => {
    if (date && initialDate !== date && !availableTimesForDate.includes(timeSlot)) {
      setTimeSlot('');
    }
  }, [date, availableTimesForDate, timeSlot, initialDate]);

  const validateStep1 = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(phone)) e.phone = 'Phone must be a valid 10-digit number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!date) e.date = 'Date is required';
    if (!timeSlot) e.timeSlot = 'Time slot is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setConflictError('');
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        expertId,
        name,
        email,
        phone,
        date,
        timeSlot,
        notes
      });
      setSuccess(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError('This slot was just booked. Please choose another.');
        setStep(2);
        setExpert(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            availableSlots: prev.availableSlots.map(s =>
              s.date === date && s.time === timeSlot ? { ...s, isBooked: true } : s
            )
          };
        });
      } else {
        setErrors({ submit: err.response?.data?.message || 'Booking failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const allDates = useMemo(() => {
    if (!expert) return [];
    const dates = new Set(expert.availableSlots.filter(s => !s.isBooked).map(s => s.date));
    return Array.from(dates).sort();
  }, [expert]);

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 fade-in">
        <div className="glass rounded-3xl p-8 md:p-12 text-center shadow-xl border border-[var(--border)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--success)]/10 to-transparent pointer-events-none"></div>
          
          <div className="flex justify-center mb-8 relative z-10">
            <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          
          <div className="animate-fadeIn relative z-10" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Booking Confirmed!</h2>
            <p className="text-[var(--text-secondary)] mb-8 text-lg">Your session with <span className="font-semibold text-[var(--text-primary)]">{success.expertId?.name || 'Expert'}</span> has been successfully scheduled.</p>
            
            <div className="bg-[var(--surface)]/80 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left border border-[var(--border)] shadow-sm inline-block w-full max-w-md">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div className="text-[var(--text-muted)] flex items-center gap-2"><Calendar size={16} /> Date</div>
                <div className="font-semibold text-[var(--text-primary)]">{success.date}</div>
                
                <div className="text-[var(--text-muted)] flex items-center gap-2"><Clock size={16} /> Time</div>
                <div className="font-semibold text-[var(--text-primary)]">{success.timeSlot}</div>
                
                <div className="text-[var(--text-muted)] flex items-center gap-2"><UserIcon size={16} /> Name</div>
                <div className="font-semibold text-[var(--text-primary)] truncate">{success.name}</div>
                
                <div className="text-[var(--text-muted)] flex items-center gap-2"><Check size={16} /> Status</div>
                <div><span className="inline-block bg-[var(--warning)]/10 text-[var(--warning)] px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Pending</span></div>
              </div>
            </div>
            
            <div>
              <button
                onClick={() => navigate('/my-bookings')}
                className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:scale-105 transition-transform shadow-lg font-medium"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 fade-in">
      <button onClick={() => navigate(`/experts/${expertId}`)} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-6 transition-colors group font-medium">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Expert Profile
      </button>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--surface-3)] rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--primary)] rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {[1, 2, 3].map(i => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 border-2 
                ${step >= i ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]'}`}>
                {step > i ? <Check size={20} /> : i}
              </div>
              <span className={`absolute top-12 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${step >= i ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                {i === 1 ? 'Details' : i === 2 ? 'Schedule' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl shadow-lg border border-[var(--border)] overflow-hidden mt-16 relative">
        {expert && (
          <div className="bg-gradient-to-r from-[var(--surface-3)] to-[var(--surface-2)] p-6 border-b border-[var(--border)] flex justify-between items-center">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Booking Session With</p>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{expert.name}</h2>
            </div>
            <div className="text-right">
              <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--primary)]/20">
                {expert.category}
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] mt-2">${expert.hourlyRate}/hr</p>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 relative">
          {conflictError && <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-3 rounded-lg mb-6 text-sm border border-[var(--danger)]/20">{conflictError}</div>}
          {errors.submit && <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-3 rounded-lg mb-6 text-sm border border-[var(--danger)]/20">{errors.submit}</div>}

          <form className="relative">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="fade-in">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Personal Details</h3>
                <div className="space-y-6">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="peer input-glow block w-full pl-12 pr-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                    <label htmlFor="name" className="absolute left-12 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Full Name</label>
                    {errors.name && <p className="text-[var(--danger)] text-xs mt-1 absolute -bottom-5">{errors.name}</p>}
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="peer input-glow block w-full pl-12 pr-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                    <label htmlFor="email" className="absolute left-12 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Email Address</label>
                    {errors.email && <p className="text-[var(--danger)] text-xs mt-1 absolute -bottom-5">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone Number" className="peer input-glow block w-full pl-12 pr-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                    <label htmlFor="phone" className="absolute left-12 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Phone (10 digits)</label>
                    {errors.phone && <p className="text-[var(--danger)] text-xs mt-1 absolute -bottom-5">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="mt-12 flex justify-end">
                  <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors font-medium">
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="fade-in">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Select Schedule</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">Available Dates</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {allDates.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDate(d)}
                          className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
                            date === d 
                              ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] ring-2 ring-[var(--primary)]/20 font-bold' 
                              : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50'
                          }`}
                        >
                          <div className="text-xs uppercase">{new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-lg">{new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                        </button>
                      ))}
                      {allDates.length === 0 && <div className="text-[var(--text-muted)] text-sm p-4 bg-[var(--surface-3)] rounded-lg border border-[var(--border)] w-full text-center">No dates available.</div>}
                    </div>
                    {errors.date && <p className="text-[var(--danger)] text-xs mt-1">{errors.date}</p>}
                  </div>

                  <div className={`transition-opacity duration-300 ${!date ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Clock size={16} /> Available Times
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableTimesForDate.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTimeSlot(t)}
                          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                            timeSlot === t 
                              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white border-transparent shadow-md transform scale-105' 
                              : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-3)]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      {date && availableTimesForDate.length === 0 && (
                        <div className="col-span-full text-[var(--text-muted)] text-sm p-3 text-center">No times available for this date.</div>
                      )}
                    </div>
                    {errors.timeSlot && <p className="text-[var(--danger)] text-xs mt-1">{errors.timeSlot}</p>}
                  </div>
                </div>

                <div className="mt-12 flex justify-between">
                  <button type="button" onClick={prevStep} className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] rounded-xl transition-colors font-medium">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors font-medium">
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="fade-in">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Confirm Details</h3>
                
                <div className="bg-[var(--surface-3)] rounded-2xl p-5 mb-6 border border-[var(--border)]">
                  <h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 border-b border-[var(--border)] pb-2">Session Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--text-muted)] mb-1">Date</p>
                      <p className="font-semibold text-[var(--text-primary)] flex items-center gap-2"><Calendar size={14}/> {date}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] mb-1">Time</p>
                      <p className="font-semibold text-[var(--text-primary)] flex items-center gap-2"><Clock size={14}/> {timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] mb-1">Name</p>
                      <p className="font-medium text-[var(--text-primary)] truncate">{name}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] mb-1">Contact</p>
                      <p className="font-medium text-[var(--text-primary)] truncate">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-[var(--text-muted)]" size={20} />
                  <textarea 
                    id="notes" 
                    rows={3} 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="Additional notes or topics to discuss..." 
                    className="peer input-glow block w-full pl-12 pr-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent resize-none"
                  />
                  <label htmlFor="notes" className="absolute left-12 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Additional Notes (Optional)</label>
                </div>

                <div className="mt-12 flex justify-between">
                  <button type="button" onClick={prevStep} className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] rounded-xl transition-colors font-medium">
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:scale-[1.02] transition-transform font-medium shadow-lg shadow-[var(--primary)]/30 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {submitting ? (
                      <><Loader2 className="animate-spin" size={18} /> Processing...</>
                    ) : (
                      <><Check size={18} /> Confirm Booking</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
