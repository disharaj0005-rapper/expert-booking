import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Filter, ChevronLeft, ChevronRight, Award, DollarSign } from 'lucide-react';
import api from '../services/api';

const categories = ['All', 'Tech', 'Finance', 'Health', 'Legal', 'Marketing'];
const sortOptions = [
  { label: 'Default', value: '' },
  { label: 'Rating', value: 'rating' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Experience', value: 'experience' }
];
const availOptions = [
  { label: 'All', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' }
];

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const getCategoryColor = (cat) => {
  const colors = {
    Tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Legal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Marketing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  };
  return colors[cat] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
};
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

function ExpertCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm p-5 flex flex-col h-full overflow-hidden relative">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-14 h-14 rounded-full shimmer flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 shimmer rounded w-3/4 mb-2"></div>
          <div className="h-4 shimmer rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-4 shimmer rounded w-1/3 mb-2 mt-auto"></div>
      <div className="h-8 shimmer rounded w-full mt-4"></div>
    </div>
  );
}

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

export default function ExpertListing() {
  const [experts, setExperts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sortBy, minRating, maxPrice, availability]);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 8 };
      if (category !== 'All') params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      if (sortBy) params.sortBy = sortBy;
      if (minRating) params.minRating = minRating;
      if (maxPrice) params.maxPrice = maxPrice;
      if (availability) params.availability = availability;
      const res = await api.get('/experts', { params });
      setExperts(res.data.data);
      setTotalPages(res.data.totalPages);
      // Featured: approved experts with rating >= 4.5
      setFeatured(res.data.data.filter(e => e.rating >= 4.5).slice(0, 4));
    } catch (err) {
      setError('Failed to load experts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch, sortBy, minRating, maxPrice, availability]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  return (
    <div className="fade-in py-6">
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4">Find Your Expert</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">Connect with top-rated professionals for 1-on-1 personalized sessions.</p>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-2xl p-4 md:p-6 mb-10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, skill..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="input-glow w-full pl-10 pr-4 py-3 rounded-xl focus:ring-0" 
            />
          </div>
          
          <div className="hidden md:flex flex-1 gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-[var(--surface-3)] rounded-xl text-[var(--text-primary)] font-medium"
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Extended Filters */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 transition-all duration-300 ${isFilterOpen ? 'block slide-in' : 'hidden md:grid'}`}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-glow px-3 py-2.5 rounded-xl appearance-none">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={availability} onChange={e => setAvailability(e.target.value)} className="input-glow px-3 py-2.5 rounded-xl appearance-none">
            {availOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" size={16} />
            <input type="number" placeholder="Min Rating (0-5)" min="0" max="5" step="0.1" value={minRating} onChange={e => setMinRating(e.target.value)} className="input-glow pl-9 pr-3 py-2.5 rounded-xl w-full" />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--success)]" size={16} />
            <input type="number" placeholder="Max Price ($)" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input-glow pl-9 pr-3 py-2.5 rounded-xl w-full" />
          </div>
        </div>
      </div>

      {/* Featured Experts */}
      {featured.length > 0 && !loading && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Featured Experts</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x">
            {featured.map(expert => (
              <div 
                key={expert._id} 
                onClick={() => navigate(`/experts/${expert._id}`)} 
                className="snap-start flex-shrink-0 w-[280px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer card-hover relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${getCategoryGradient(expert.category)}`}></div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Star size={10} className="fill-white" /> PRO
                </div>
                
                <div className="flex flex-col items-center mt-2 text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${getCategoryGradient(expert.category)} mb-3 shadow-inner`}>
                    {getInitials(expert.name)}
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">{expert.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{expert.experience} yrs exp</p>
                  
                  <div className="flex items-center gap-2 bg-[var(--surface-3)] px-3 py-1.5 rounded-full mb-4">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{expert.rating}</span>
                    <StarRating rating={expert.rating} />
                  </div>
                  
                  <div className="w-full pt-4 border-t border-[var(--border)] flex justify-between items-center mt-auto">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(expert.category)}`}>{expert.category}</span>
                    <span className="font-extrabold text-[var(--accent)] text-lg">${expert.hourlyRate}<span className="text-xs text-[var(--text-muted)] font-normal">/hr</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 p-4 rounded-xl mb-6">{error}</div>}

      {/* Main Expert Grid */}
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">All Experts</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ExpertCardSkeleton key={i} />)}
        </div>
      ) : experts.length === 0 ? (
        <div className="text-center py-20 bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
          <div className="w-20 h-20 bg-[var(--surface-3)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-[var(--text-muted)]" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No experts found</h3>
          <p className="text-[var(--text-secondary)]">Try adjusting your filters or search term.</p>
          <button onClick={() => {setSearch(''); setCategory('All'); setSortBy(''); setMinRating(''); setMaxPrice(''); setAvailability('');}} className="mt-4 text-[var(--primary)] font-medium hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map(expert => (
            <div
              key={expert._id}
              onClick={() => navigate(`/experts/${expert._id}`)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer card-hover flex flex-col group overflow-hidden relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${getCategoryGradient(expert.category)} flex-shrink-0`}>
                  {getInitials(expert.name)}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md ${getCategoryColor(expert.category)}`}>{expert.category}</span>
              </div>
              
              <h3 className="font-bold text-lg text-[var(--text-primary)] leading-tight mb-1">{expert.name}</h3>
              <p className="text-[var(--text-muted)] text-xs mb-3 flex-1">{expert.experience} years • {expert.bio?.substring(0, 40)}{expert.bio?.length > 40 ? '...' : ''}</p>
              
              <div className="flex justify-between items-end mt-auto pt-4 border-t border-[var(--border)] relative">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{expert.rating}</span>
                  </div>
                  <div className="font-extrabold text-[var(--text-primary)]">${expert.hourlyRate}<span className="text-xs font-normal text-[var(--text-muted)]">/hr</span></div>
                </div>
                
                {/* Hover Button */}
                <div className="absolute right-0 bottom-0 bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-xs font-medium translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out shadow-md">
                  View Profile
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-full font-medium transition-all ${
                  p === page 
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md transform scale-110' 
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--surface-3)] transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
