import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'expert') navigate('/expert/dashboard');
      else if (res.data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)] bg-[var(--surface)] max-w-5xl mx-auto my-8 fade-in">
      {/* Left side - Gradient Banner */}
      <div className="w-full md:w-1/2 gradient-bg p-12 text-white flex flex-col justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-6">Welcome Back</h2>
          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Access your dashboard to manage your bookings, schedule expert sessions, and unlock your full potential.
          </p>
          <div className="flex items-center gap-3 text-sm font-medium text-white/90 bg-white/10 w-max px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Secure Login
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[var(--surface)]">
        <div className={`max-w-md w-full mx-auto glass p-8 rounded-2xl ${isShaking ? 'shake' : ''}`}>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Sign in to your account</h1>
          <p className="text-[var(--text-secondary)] mb-8 text-sm">Enter your details to proceed.</p>
          
          {error && (
            <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-3 rounded-lg mb-6 text-sm border border-[var(--danger)]/20 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent"
              />
              <label 
                htmlFor="email" 
                className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none"
              >
                Email address
              </label>
            </div>
            
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="peer input-glow block w-full px-4 pt-6 pb-2 rounded-xl text-[var(--text-primary)] bg-transparent placeholder-transparent"
              />
              <label 
                htmlFor="password" 
                className="absolute left-4 top-2 text-xs font-medium text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary)] pointer-events-none"
              >
                Password
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-medium hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
