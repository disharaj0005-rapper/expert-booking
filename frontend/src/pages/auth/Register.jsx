import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, User as UserIcon, Briefcase } from 'lucide-react';
import api from '../../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('user');
  const [category, setCategory] = useState('Tech');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();

  const categories = ['Tech', 'Finance', 'Health', 'Legal', 'Marketing'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { 
      setError('Passwords do not match'); 
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return; 
    }
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'expert') {
        payload.category = category;
        payload.experience = parseInt(experience) || 1;
        payload.bio = bio;
        payload.hourlyRate = parseFloat(hourlyRate) || 50;
      }
      const res = await api.post('/auth/register', payload);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)] bg-[var(--surface)] max-w-6xl mx-auto my-8 fade-in">
      {/* Left side - Gradient Banner */}
      <div className="w-full md:w-5/12 gradient-bg p-12 text-white flex flex-col justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-6">Join ExpertBooking</h2>
          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Create an account to connect with top industry experts or share your own knowledge and monetize your expertise.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
              <UserIcon className="text-green-300" />
              <div>
                <h4 className="font-semibold">For Users</h4>
                <p className="text-sm text-white/80">Book 1-on-1 sessions instantly.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
              <Briefcase className="text-yellow-300" />
              <div>
                <h4 className="font-semibold">For Experts</h4>
                <p className="text-sm text-white/80">Set your rates and manage slots.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-[var(--surface)] overflow-y-auto">
        <div className={`max-w-xl w-full mx-auto glass p-8 rounded-2xl ${isShaking ? 'shake' : ''}`}>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create an account</h1>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">Fill in your details below to get started.</p>
          
          {error && (
            <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-3 rounded-lg mb-6 text-sm border border-[var(--danger)]/20 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-[var(--success)]/10 text-[var(--success)] p-3 rounded-lg mb-6 text-sm border border-[var(--success)]/20 flex items-center gap-2">
              <span className="font-semibold">Success:</span> {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle Pill Buttons */}
            <div className="flex bg-[var(--surface-3)] p-1 rounded-xl mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'user' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                onClick={() => setRole('user')}
              >
                I am a User
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'expert' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                onClick={() => setRole('expert')}
              >
                I am an Expert
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                <label htmlFor="name" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Full Name</label>
              </div>
              <div className="relative">
                <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                <label htmlFor="email" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Email address</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                <label htmlFor="password" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Password</label>
              </div>
              <div className="relative">
                <input id="confirm" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm Password" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                <label htmlFor="confirm" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Confirm Password</label>
              </div>
            </div>

            {role === 'expert' && (
              <div className="space-y-5 pt-4 border-t border-[var(--border)] slide-in">
                <h3 className="font-semibold text-[var(--text-primary)]">Expertise Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent appearance-none">
                      {categories.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                    </select>
                    <label htmlFor="category" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] pointer-events-none">Category</label>
                  </div>
                  <div className="relative">
                    <input id="experience" type="number" min="0" required value={experience} onChange={e => setExperience(e.target.value)} placeholder="Experience (years)" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                    <label htmlFor="experience" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Experience (years)</label>
                  </div>
                </div>
                
                <div className="relative">
                  <input id="hourlyRate" type="number" min="0" required value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="Hourly Rate ($)" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent" />
                  <label htmlFor="hourlyRate" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Hourly Rate ($)</label>
                </div>

                <div className="relative">
                  <textarea id="bio" rows={3} required value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent resize-none"></textarea>
                  <label htmlFor="bio" className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none">Bio / Short Description</label>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-medium hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Registering...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
