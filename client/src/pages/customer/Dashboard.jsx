import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { getApiUrl } from '../../config/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('api/bookings/my'));
      const bookings = response.data.bookings || [];

      // Calculate stats
      setStats({
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b =>
          ['pending', 'accepted', 'confirmed', 'in_progress', 'provider_completed'].includes(b.status)
        ).length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        pendingReviews: bookings.filter(b =>
          b.status === 'completed' && !b.reviewed
        ).length,
      });

      // Get 3 most recent bookings
      setRecentBookings(bookings.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      accepted: 'badge-info',
      confirmed: 'badge-info',
      in_progress: 'badge-info',
      provider_completed: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-error',
      issue_reported: 'badge-error',
    };
    return colors[status] || 'badge-info';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-display text-slate-900 dark:text-neutral-100 tracking-tight mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-lg text-slate-600 dark:text-neutral-300">Find the best professionals for your home needs today</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-2xl font-bold text-slate-900 dark:text-neutral-100 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Preferences
            </button>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Service
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LoadingSkeleton type="stat" count={4} />
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                subtitle="All-time bookings"
                color="blue"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                link={{ href: '/customer/bookings', label: 'View all bookings' }}
              />

              <StatCard
                title="Active Bookings"
                value={stats.activeBookings}
                subtitle="In progress"
                color="amber"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <StatCard
                title="Completed"
                value={stats.completedBookings}
                subtitle="Successfully finished"
                color="emerald"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <StatCard
                title="Pending Reviews"
                value={stats.pendingReviews}
                subtitle="Share your experience"
                color="indigo"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              />
            </div>

            {/* Recent Bookings */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-neutral-100 mb-1">Recent Bookings</h2>
                  <p className="text-sm text-slate-600 dark:text-neutral-300">Your latest service requests</p>
                </div>
                <Link to="/customer/bookings" className="btn btn-ghost text-sm">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <EmptyState
                  title="No bookings yet"
                  description="Start by browsing our services and book your first service provider."
                  action={{
                    label: 'Browse Services',
                    onClick: () => navigate('/services'),
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    ),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 group cursor-pointer"
                      onClick={() => navigate('/customer/bookings')}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-neutral-100 truncate mb-1">
                          {booking.service?.title || 'Service'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-neutral-300">
                          {formatDate(booking.bookingDate)} • {booking.bookingTime}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`badge ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        <span className="text-2xl font-bold font-display text-blue-600">
                          ${booking.totalAmount}
                        </span>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories & Actions */}
            <div className="grid lg:grid-cols-3 gap-8 mt-10">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-neutral-100 mb-6 uppercase tracking-wider text-sm opacity-50">Popular Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { name: 'Cleaning', icon: '🏠', color: 'bg-blue-50 text-blue-600' },
                    { name: 'Plumbing', icon: '🔧', color: 'bg-emerald-50 text-emerald-600' },
                    { name: 'Electricity', icon: '⚡', color: 'bg-amber-50 text-amber-600' },
                    { name: 'Painting', icon: '🎨', color: 'bg-rose-50 text-rose-600' },
                  ].map((cat, i) => (
                    <div
                      key={i}
                      onClick={() => navigate('/services')}
                      className="p-6 bg-white dark:bg-neutral-800 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center gap-3 border border-slate-100 dark:border-neutral-700 group"
                    >
                      <div className={`text-4xl p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                      <span className="font-bold text-slate-800 dark:text-neutral-200 text-sm">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-neutral-100 mb-6 uppercase tracking-wider text-sm opacity-50">Need Help?</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden group cursor-pointer">
                    <div className="relative z-10">
                      <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
                      <p className="text-slate-400 text-sm mb-4">Our team is here to help with any booking issues.</p>
                      <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:gap-3 transition-all">
                        Chat with us <span>→</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-125 transition-transform">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.03 1.05 4.34L2 22l5.66-1.05C8.97 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
