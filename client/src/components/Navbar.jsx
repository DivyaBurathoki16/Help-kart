import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import ChatListModal from './ChatListModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatConversations, setChatConversations] = useState([]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch chat unread count
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'customer' || user?.role === 'provider')) {
      fetchChatUnreadCount();
      // Poll every 10 seconds for unread count
      const interval = setInterval(fetchChatUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchChatUnreadCount = async () => {
    try {
      const response = await axios.get(getApiUrl('api/chat/conversations'), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const conversations = response.data.conversations || [];
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setChatUnreadCount(totalUnread);
        setChatConversations(conversations);
      }
    } catch (error) {
      // Silently fail
      console.error('Error fetching chat unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const UserAvatar = ({ name }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white transition-transform hover:scale-110">
        {initials}
      </div>
    );
  };

  const navLinkClass = (path) => `
    px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300
    ${location.pathname === path
      ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-900/30'
      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'}
  `;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass rounded-3xl transition-all duration-500 shadow-xl shadow-blue-500/5 dark:shadow-neutral-950/20 dark:shadow-[0_10px_40px_rgba(59,130,246,0.05)] ${scrolled ? 'px-4 py-2' : 'px-6 py-3'} bg-white/90 dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 dark:border-b-neutral-600/80`}>
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl">HK</span>
              </div>
              <span className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-neutral-100">
                HelpKart
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-2">
              {/* Chat Button - Only for authenticated users */}
              {isAuthenticated && (user?.role === 'customer' || user?.role === 'provider') && (
                <div className="relative">
                  <button
                    onClick={() => setChatModalOpen(true)}
                    className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800 transition-all duration-200 relative"
                    aria-label="Chat"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {chatUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
              {/* Theme Toggle Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800 transition-all duration-200"
                aria-label="Toggle theme"
                type="button"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              {!isAuthenticated ? (
                <>
                  <>
                    <Link to="/services" className={navLinkClass('/services')}>Services</Link>
                    <Link to="/how-it-works" className={navLinkClass('/how-it-works')}>How It Works</Link>
                    <Link to="/why-us" className={navLinkClass('/why-us')}>Why Us</Link>
                    <Link to="/reviews" className={navLinkClass('/reviews')}>Reviews</Link>
                    <Link to="/contact" className={navLinkClass('/contact')}>Contact Us</Link>
                    <div className="flex items-center gap-3 ml-4">
                      <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl transition-colors dark:text-neutral-200 dark:border-neutral-700 dark:hover:text-blue-400">Log In</Link>
                      <Link to="/register" className="bg-[#2563eb] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Book Now</Link>
                    </div>
                  </>
                </>
              ) : (
                <>
                  {user.role === 'customer' && (
                    <>
                      <Link to="/services" className={navLinkClass('/services')}>Services</Link>
                      <Link to="/customer/near-me" className={navLinkClass('/customer/near-me')}>Near Me</Link>
                      <Link to="/customer/dashboard" className={navLinkClass('/customer/dashboard')}>Dashboard</Link>
                      <Link to="/customer/bookings" className={navLinkClass('/customer/bookings')}>My Bookings</Link>
                    </>
                  )}
                  {user.role === 'provider' && (
                    <>
                      <Link to="/provider/dashboard" className={navLinkClass('/provider/dashboard')}>Dashboard</Link>
                      <Link to="/provider/services" className={navLinkClass('/provider/services')}>My Services</Link>
                      <Link to="/provider/bookings" className={navLinkClass('/provider/bookings')}>Bookings</Link>
                      <Link to="/provider/profile" className={navLinkClass('/provider/profile')}>Profile</Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>Admin Dashboard</Link>
                  )}

                  {/* User Menu - Advanced Settings Only */}
                  <div className="relative ml-4">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-0.5 rounded-2xl hover:bg-blue-50/50 transition-colors"
                    >
                      <UserAvatar name={user.name} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-700 overflow-hidden z-50 animate-fade-in-up">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900/50">
                          <p className="text-sm font-bold text-slate-900 dark:text-neutral-100 leading-none">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 truncate">{user.email}</p>
                          <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-md inline-block">
                            {user.role}
                          </div>
                        </div>

                        {/* Profile Section */}
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                            Your Account
                          </div>
                          <Link
                            to={user.role === 'customer' ? "/customer/profile" : "/provider/profile"}
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-slate-200 dark:border-neutral-700">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-all flex items-center gap-3 group"
                          >
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              {/* Theme Toggle Button - Mobile */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800 transition-all duration-200"
                aria-label="Toggle theme"
                type="button"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-0.5 rounded-2xl hover:bg-blue-50/50 transition-colors"
                  >
                    <UserAvatar name={user.name} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-700 overflow-hidden z-50 animate-fade-in-up">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900/50">
                        <p className="text-sm font-bold text-slate-900 dark:text-neutral-100 leading-none">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 truncate">{user.email}</p>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-0.5 rounded-md inline-block">
                          {user.role}
                        </div>
                      </div>

                      {/* Profile Section */}
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                          Your Account
                        </div>
                        <Link
                          to={user.role === 'customer' ? "/customer/profile" : "/provider/profile"}
                          onClick={() => {
                            setUserMenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-200 dark:border-neutral-700">
                        <button
                          onClick={() => {
                            handleLogout();
                            setUserMenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-all flex items-center gap-3 group"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-0 bottom-0 bg-white dark:bg-neutral-950 z-40 overflow-y-auto animate-slide-in shadow-2xl">
          {/* Premium Header Section */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-950 dark:to-neutral-900 backdrop-blur-sm border-b border-slate-100 dark:border-neutral-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">HK</span>
                </div>
                <div>
                  <h3 className="text-lg font-black font-display tracking-tight text-slate-900 dark:text-neutral-100">HelpKart</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium mt-0.5">Helping you book faster</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-6 py-6 space-y-2">
            {/* Chat Button - Mobile - Only for authenticated users */}
            {isAuthenticated && (user?.role === 'customer' || user?.role === 'provider') && (
              <button
                onClick={() => {
                  setChatModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="group flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-base font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98] relative"
                type="button"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Messages</span>
                {chatUnreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                  </span>
                )}
              </button>
            )}
            {/* Theme Toggle in Mobile Menu */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className="group flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-base font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98]"
              type="button"
            >
              {theme === 'light' ? (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              )}
            </button>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/services"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/services'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Services</span>
                </Link>
                <Link
                  to="/how-it-works"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/how-it-works'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>How It Works</span>
                </Link>
                <Link
                  to="/why-us"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/why-us'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Why Us</span>
                </Link>
                <Link
                  to="/reviews"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/reviews'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Reviews</span>
                </Link>
                <Link
                  to="/contact"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/contact'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Us</span>
                </Link>

                {/* Grouped Actions at Bottom */}
                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-neutral-700 space-y-3">
                  <Link
                    to="/login"
                    className="group flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-semibold text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-neutral-100 rounded-xl transition-all duration-200 active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Log In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="group flex items-center justify-center gap-2 w-full px-6 py-4 text-base font-bold text-white bg-gradient-to-r from-[#2563eb] to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Book Now</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link
                      to="/services"
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                        location.pathname === '/services'
                          ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Services</span>
                    </Link>
                    <Link
                      to="/customer/near-me"
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                        location.pathname === '/customer/near-me'
                          ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Near Me</span>
                    </Link>
                    <Link
                      to="/customer/bookings"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/customer/bookings'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>My Bookings</span>
                    </Link>
                  </>
                )}
                {user.role === 'provider' && (
                  <>
                    <Link
                      to="/provider/services"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/provider/services'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>My Services</span>
                    </Link>
                    <Link
                      to="/provider/bookings"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/provider/bookings'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Bookings</span>
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] ${
                    location.pathname === '/admin/dashboard'
                      ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800'
                  }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-neutral-700">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="group flex items-center gap-3 w-full px-4 py-3.5 text-base font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-xl transition-all duration-200 active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spacer to prevent content jump since navbar is fixed */}
      <div className="h-0 md:h-2" />

      {/* Chat List Modal */}
      {isAuthenticated && (user?.role === 'customer' || user?.role === 'provider') && (
        <ChatListModal
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            fetchChatUnreadCount(); // Refresh unread count when closing
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;

