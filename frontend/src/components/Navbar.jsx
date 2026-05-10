import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Bell, Menu, X, LogOut } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  
  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(res => setNotifs(res.data)).catch(() => {});
  }, [user]);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowNotifs(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`relative text-sm py-1 transition-colors
          ${isActive ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
          after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-left 
          after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-[var(--primary)]
          ${isActive ? 'after:scale-x-100' : ''}
        `}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold gradient-text">ExpertBooking</Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/">Experts</NavLink>
          
          {/* User Links */}
          {user?.role === 'user' && (
            <NavLink to="/my-bookings">My Bookings</NavLink>
          )}
          
          {/* Expert Links */}
          {user?.role === 'expert' && (
            <>
              <NavLink to="/expert/dashboard">Dashboard</NavLink>
              <NavLink to="/expert/slots">Slots</NavLink>
              <NavLink to="/expert/profile">Profile</NavLink>
            </>
          )}
          
          {/* Admin Links */}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/dashboard">Stats</NavLink>
              <NavLink to="/admin/experts">Experts</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/bookings">Bookings</NavLink>
            </>
          )}
          
          <button 
            onClick={toggleTheme} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-transform duration-300 active:rotate-180"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)} 
                className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--danger)] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 slide-in overflow-hidden">
                  <div className="p-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-2)]">
                    <span className="font-semibold text-sm text-[var(--text-primary)]">Notifications</span>
                    <button onClick={markAllRead} className="text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 && <div className="p-4 text-sm text-[var(--text-muted)] text-center">No notifications yet.</div>}
                    {notifs.slice(0, 5).map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => { markRead(n._id); navigate('/notifications'); setShowNotifs(false); }} 
                        className={`p-3 text-sm cursor-pointer transition-colors border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-3)] ${!n.read ? 'border-l-4 border-l-[var(--primary)] bg-[var(--surface-2)]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <p className={`text-[var(--text-primary)] ${!n.read ? 'font-medium' : 'font-normal'}`}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <Link 
                    to="/notifications" 
                    onClick={() => setShowNotifs(false)}
                    className="p-3 text-center text-xs font-bold text-[var(--primary)] bg-[var(--surface-2)] border-t border-[var(--border)] block hover:bg-[var(--surface-3)] transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
              <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px]" title={user.name}>{user.name}</span>
              <button onClick={handleLogout} className="text-[var(--danger)] hover:text-red-700 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
              <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium px-4 py-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-full hover:scale-105 transition-transform shadow-md">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="text-[var(--text-secondary)]">
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[var(--text-primary)]">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--surface)] border-b border-[var(--border)] shadow-xl slide-in">
          <div className="flex flex-col p-4 space-y-4">
            <NavLink to="/">Experts</NavLink>
            
            {user?.role === 'user' && <NavLink to="/my-bookings">My Bookings</NavLink>}
            
            {user?.role === 'expert' && (
              <>
                <NavLink to="/expert/dashboard">Dashboard</NavLink>
                <NavLink to="/expert/slots">Manage Slots</NavLink>
                <NavLink to="/expert/profile">My Profile</NavLink>
              </>
            )}
            
            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin/dashboard">Admin Stats</NavLink>
                <NavLink to="/admin/experts">Manage Experts</NavLink>
                <NavLink to="/admin/users">Manage Users</NavLink>
                <NavLink to="/admin/bookings">All Bookings</NavLink>
              </>
            )}
            
            {user ? (
              <>
                <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
                   <Link 
                     to="/notifications" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="flex items-center gap-2 text-[var(--text-primary)]"
                   >
                     <Bell size={18} className="text-[var(--text-secondary)]"/>
                     <span className="text-sm">Notifications ({unreadCount})</span>
                   </Link>
                   <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-[var(--primary)] font-bold">View All</Link>
                </div>
                <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{user.name}</span>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-[var(--danger)]">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-sm font-medium py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-lg shadow-md">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
