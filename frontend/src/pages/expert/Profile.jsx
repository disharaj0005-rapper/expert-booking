import { useEffect, useState } from 'react';
import { User, CheckCircle2, Save, Briefcase, Award, DollarSign, FileText, UserCog, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ExpertProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const p = res.data.expertProfile;
      setProfile(p);
      setForm({ ...p });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/experts/${profile._id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--text-secondary)] font-medium">Loading profile...</p>
    </div>
  );
  
  if (!profile) return <div className="text-center py-12 text-[var(--danger)] bg-[var(--danger)]/10 rounded-xl max-w-xl mx-auto mt-12 border border-[var(--danger)]/20">Profile not found. Please contact support.</div>;

  return (
    <div className="fade-in max-w-3xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <UserCog size={32} className="text-[var(--primary)]" /> My Profile
          </h1>
          <p className="text-[var(--text-secondary)]">Manage your public information and expertise details.</p>
        </div>
      </div>

      {saved && (
        <div className="bg-[var(--success)]/10 text-[var(--success)] p-4 rounded-xl border border-[var(--success)]/20 flex items-center gap-3 mb-6 slide-in shadow-sm">
          <CheckCircle2 size={20} /> 
          <span className="font-semibold">Profile updated successfully!</span>
        </div>
      )}
      
      {error && (
        <div className="bg-[var(--danger)]/10 text-[var(--danger)] p-4 rounded-xl border border-[var(--danger)]/20 flex items-center gap-3 mb-6 slide-in shadow-sm">
          <AlertCircle size={20} /> 
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={save} className="glass rounded-2xl shadow-sm p-6 md:p-8 border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <User size={16} className="text-[var(--text-muted)]" /> Full Name
            </label>
            <input 
              name="name" 
              value={form.name || ''} 
              onChange={handleChange} 
              className="input-glow w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Briefcase size={16} className="text-[var(--text-muted)]" /> Category / Expertise
            </label>
            <input 
              name="category" 
              value={form.category || ''} 
              onChange={handleChange} 
              className="input-glow w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Award size={16} className="text-[var(--text-muted)]" /> Experience (years)
            </label>
            <input 
              name="experience" 
              type="number" 
              min="0"
              value={form.experience || ''} 
              onChange={handleChange} 
              className="input-glow w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0" 
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-[var(--text-muted)]" /> Hourly Rate (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">$</span>
              <input 
                name="hourlyRate" 
                type="number" 
                min="0"
                value={form.hourlyRate || ''} 
                onChange={handleChange} 
                className="input-glow w-full pl-8 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0" 
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <FileText size={16} className="text-[var(--text-muted)]" /> Professional Bio
            </label>
            <textarea 
              name="bio" 
              rows={5} 
              value={form.bio || ''} 
              onChange={handleChange} 
              placeholder="Tell clients about your background, expertise, and what they can expect in a session..."
              className="input-glow w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text-primary)] focus:ring-0 resize-none" 
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center justify-center gap-2 py-3 px-8 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5 font-semibold text-lg disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Save size={20} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
