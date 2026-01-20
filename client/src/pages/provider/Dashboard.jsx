import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Card from '../../components/ui/Card';
import { getApiUrl } from '../../config/api';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalServices: 0,
    pendingBookings: 0,
    completedJobs: 0,
    acceptedBookings: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    paidBookings: 0,
    unpaidBookings: 0,
    paidRevenue: 0,
    confirmedBookings: 0,
<<<<<<< HEAD
    monthlyRevenue: [], // { label, value } per recent month
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
  });
  const [behavioralState, setBehavioralState] = useState({
    reports: [],
    reportCount: 0,
    warningCount: 0,
    isSuspended: false,
    suspensionExpiresAt: null,
    isBanned: false,
    loading: true
  });

  useEffect(() => {
    fetchStats();
    fetchBehavioralData();
  }, []);

<<<<<<< HEAD
  const hasMonthlyRevenue = stats.monthlyRevenue && stats.monthlyRevenue.some((m) => m.value > 0);
  const maxMonthlyRevenue = hasMonthlyRevenue
    ? Math.max(...stats.monthlyRevenue.map((m) => m.value))
    : 0;

=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
  const fetchStats = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        axios.get(getApiUrl('api/provider/services')),
        axios.get(getApiUrl('api/provider/bookings')),
      ]);

      const services = servicesRes.data.services || [];
      const bookings = bookingsRes.data.bookings || [];

      const completedBookings = bookings.filter((b) => b.status === 'completed');
      const paidBookings = bookings.filter((b) => b.paymentStatus === 'paid');
      const unpaidBookings = bookings.filter((b) => b.paymentStatus === 'unpaid' || !b.paymentStatus);
      const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthCompleted = completedBookings.filter((b) => {
        const completedDate = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt);
        return completedDate >= thisMonth;
      });

<<<<<<< HEAD
      // Build revenue per month for the last 6 months (including current)
      const now = new Date();
      const monthBuckets = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthBuckets.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleString('default', { month: 'short' }),
          value: 0,
        });
      }

      completedBookings.forEach((booking) => {
        const completedDate = booking.completedAt ? new Date(booking.completedAt) : new Date(booking.createdAt);
        const bucketKey = `${completedDate.getFullYear()}-${completedDate.getMonth()}`;
        const bucket = monthBuckets.find((m) => m.key === bucketKey);
        if (bucket) {
          bucket.value += booking.totalAmount || 0;
        }
      });

=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
      setStats({
        totalServices: services.length,
        pendingBookings: bookings.filter((b) => b.status === 'pending').length,
        acceptedBookings: bookings.filter((b) => b.status === 'accepted').length,
        completedJobs: completedBookings.length,
        totalRevenue: completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        thisMonthRevenue: thisMonthCompleted.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        paidBookings: paidBookings.length,
        unpaidBookings: unpaidBookings.length,
        paidRevenue: paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        confirmedBookings: confirmedBookings.length,
<<<<<<< HEAD
        monthlyRevenue: monthBuckets,
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBehavioralData = async () => {
    try {
      const response = await axios.get(getApiUrl('api/behavior-reports/my'));
      if (response.data.success) {
        setBehavioralState({
          reports: response.data.reports,
          reportCount: response.data.reportCount,
          warningCount: response.data.warningCount,
          isSuspended: response.data.isSuspended,
          suspensionExpiresAt: response.data.suspensionExpiresAt,
          isBanned: response.data.isBanned,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching behavioral data:', error);
      setBehavioralState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white py-12 transition-colors duration-500 overflow-x-hidden relative">
      {/* Soft background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/[0.04] dark:bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/[0.03] dark:bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/[0.02] dark:bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-16 bg-blue-600 rounded-full" />
              <span className="text-blue-500 font-semibold tracking-[0.25em] uppercase text-[10px]">
                Provider dashboard
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Here’s a quick overview of your services, bookings, and earnings in one simple place.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="px-5 py-4 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl backdrop-blur-xl shadow-md">
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mb-1">
                Today
              </p>
              <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Inventory tabs */}
        <div className="grid md:grid-cols-3 gap-8 pb-10">
          <Link to="/provider/services/add" className="group">
            <Card className="p-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl hover:bg-white dark:hover:bg-indigo-600/20 transition-all duration-700 rounded-[2.5rem] group relative overflow-hidden shadow-sm hover:shadow-xl dark:shadow-2xl">
              <div className="absolute inset-0 bg-indigo-600/[0.02] dark:bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-indigo-600 rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] dark:shadow-[0_10px_30px_rgba(79,70,229,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Add service</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Create a new listing</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/provider/services" className="group">
            <Card className="p-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl hover:bg-white dark:hover:bg-blue-600/20 transition-all duration-700 rounded-[2.5rem] group relative overflow-hidden shadow-sm hover:shadow-xl dark:shadow-2xl">
              <div className="absolute inset-0 bg-blue-600/[0.02] dark:bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-blue-600 rounded-3xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] dark:shadow-[0_10px_30px_rgba(37,99,235,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">My services</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Edit services and pricing</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/provider/bookings" className="group">
            <Card className="p-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl hover:bg-white dark:hover:bg-amber-600/20 transition-all duration-700 rounded-[2.5rem] group relative overflow-hidden shadow-sm hover:shadow-xl dark:shadow-2xl">
              <div className="absolute inset-0 bg-amber-600/[0.02] dark:bg-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-5 bg-amber-600 rounded-3xl shadow-[0_10px_30px_rgba(217,119,6,0.3)] dark:shadow-[0_10px_30px_rgba(217,119,6,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Bookings</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">View and respond</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Account status */}
        <div className="space-y-6 mb-16">
          {behavioralState.isBanned && (
            <div className="p-10 bg-rose-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/50 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-600/[0.02] dark:bg-red-600/5 animate-pulse" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="p-5 bg-red-600 rounded-2xl shadow-2xl shadow-red-600/50 text-white">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Your account is blocked
                  </h2>
                  <p className="text-slate-700 dark:text-red-200/70 mt-2 max-w-3xl text-sm md:text-base leading-relaxed">Your provider account has been permanently blocked because of repeated reports. Please contact support if you think this is a mistake.</p>
                </div>
              </div>
            </div>
          )}

          {!behavioralState.isBanned && behavioralState.isSuspended && (
            <div className="p-10 bg-amber-50 dark:bg-orange-600/20 border border-amber-200 dark:border-orange-500/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="p-5 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/40 text-white">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Your account is temporarily suspended
                  </h2>
                  <div className="flex flex-wrap items-center gap-6 mt-3">
                    <p className="text-slate-600 dark:text-orange-200/70 text-lg">
                      You can start taking bookings again from{' '}
                      <span className="text-blue-600 dark:text-white font-semibold underline decoration-orange-500/50">{new Date(behavioralState.suspensionExpiresAt).toLocaleDateString()}</span>
                    </p>
                    <div className="h-6 w-[2px] bg-slate-200 dark:bg-white/10 hidden md:block" />
                    <p className="text-xs bg-white dark:bg-black/40 px-5 py-2 rounded-xl text-slate-900 dark:text-white font-black tracking-widest uppercase border border-slate-200 dark:border-white/5 shadow-sm">
                      Violation Load: {behavioralState.warningCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!behavioralState.isSuspended && !behavioralState.isBanned && behavioralState.warningCount > 0 && (
            <div className="p-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 backdrop-blur-2xl rounded-[2rem] flex items-center gap-6 group hover:bg-amber-100 dark:hover:bg-amber-500/[0.15] transition-all">
              <div className="p-4 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/30 text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  You have {behavioralState.warningCount} warning{behavioralState.warningCount !== 1 ? 's' : ''}
                </h2>
                <p className="text-slate-600 dark:text-amber-200/70 mt-1 text-sm md:text-base">
                  Please provide reliable service to avoid suspension. The limit is <span className="font-semibold">3 warnings</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Key numbers */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Services & queue */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
            <Card className="p-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px] rounded-[2.5rem] shadow-xl dark:shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/[0.05] dark:bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-colors" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em] mb-4">Services</p>
                  <h3 className="text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 leading-none">{stats.totalServices}</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    Active services you are offering
                  </p>
                </div>
                <div className="p-5 bg-blue-600/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-2xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <Link to="/provider/services" className="relative z-10 mt-6 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white flex items-center gap-2 group/link">
                View and manage services <span className="group-hover/link:translate-x-1 transition-transform text-blue-500 font-bold">→</span>
              </Link>
            </Card>

            <Card className="p-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px] rounded-[2.5rem] shadow-xl dark:shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/[0.05] dark:bg-amber-600/10 rounded-full blur-[80px] group-hover:bg-amber-600/20 transition-colors" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em] mb-4">New booking requests</p>
                  <h3 className="text-8xl font-black tracking-tighter text-amber-600 dark:text-amber-500 mb-4 leading-none">{stats.pendingBookings}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Jobs waiting for your response</p>
                </div>
                <div className="p-5 bg-amber-600/20 rounded-2xl text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform shadow-2xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <Link to="/provider/bookings?status=pending" className="relative z-10 mt-6 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-white flex items-center gap-2 group/link">
                Go to booking requests <span className="group-hover/link:translate-x-1 transition-transform text-amber-500 font-bold">→</span>
              </Link>
            </Card>
          </div>

          {/* Earnings */}
          <div className="lg:col-span-4">
            <Card className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-600/90 dark:to-blue-700/90 border-none shadow-[0_20px_50px_rgba(30,58,138,0.3)] dark:shadow-[0_20px_50px_rgba(30,58,138,0.5)] h-full relative overflow-hidden group rounded-[2.5rem] text-white">
              <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-indigo-100/80 text-[10px] font-semibold uppercase tracking-[0.3em] mb-4">Total earnings</p>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-black text-indigo-300 tracking-tighter">₹</span>
                    <h3 className="text-7xl font-black tracking-tighter text-white leading-none">{stats.totalRevenue.toLocaleString()}</h3>
                  </div>
                  <p className="text-indigo-100/80 text-[11px] font-medium">Total amount you have earned from completed jobs.</p>
                </div>

                <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100/60 font-black uppercase tracking-[0.2em] text-[10px]">Active Pipelines</span>
                    <span className="text-2xl font-black text-white italic">{stats.acceptedBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100/60 font-black uppercase tracking-[0.2em] text-[10px]">Closed Sessions</span>
                    <span className="text-2xl font-black text-white italic">{stats.completedJobs}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Performance chart */}
          <div className="lg:col-span-8">
            <Card className="p-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl relative overflow-hidden h-full rounded-[2.5rem] shadow-xl dark:shadow-2xl transition-all duration-700">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Performance over time</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">See how your earnings have changed across recent months.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-black tracking-widest uppercase">Live Pulse</span>
                </div>
              </div>

              {/* Glowing Chart Grid */}
              <div className="flex items-end justify-between h-56 gap-5 mt-8 px-4">
                {(stats.monthlyRevenue && stats.monthlyRevenue.length ? stats.monthlyRevenue : []).map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-5 group/bar h-full justify-end">
                    <div className="w-full relative flex items-end h-full bg-slate-100 dark:bg-white/[0.02] rounded-2xl overflow-hidden group-hover/bar:bg-slate-200 dark:group-hover/bar:bg-white/[0.05] transition-all duration-500">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-2xl transition-all duration-1000 ease-out group-hover/bar:brightness-110 dark:group-hover/bar:brightness-125 relative shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                        style={{
                          height: hasMonthlyRevenue
                            ? `${Math.max((bar.value / (maxMonthlyRevenue || 1)) * 100, 8)}%`
                            : '5%',
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/30" />
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter group-hover/bar:text-blue-600 dark:group-hover/bar:text-white transition-colors">{bar.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick stats */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <Card className="p-8 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center gap-6 group hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-xl dark:shadow-2xl">
              <div className="p-5 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em] mb-1">Job completion rate</p>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white italic">
                  {stats.totalServices > 0 ? Math.round((stats.completedJobs / (stats.acceptedBookings + stats.completedJobs || 1)) * 100) : '0'}%
                </h4>
              </div>
            </Card>

            <Card className="p-8 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center gap-6 group hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-xl dark:shadow-2xl">
              <div className="p-5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em] mb-1">Average earning per job</p>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white italic">
                  ₹{stats.completedJobs > 0 ? (stats.totalRevenue / stats.completedJobs).toFixed(0) : '0'}
                </h4>
              </div>
            </Card>

            <Card className="p-8 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center gap-6 group hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-xl dark:shadow-2xl">
              <div className="p-5 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em] mb-1">Unpaid estimated value</p>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white italic">
                  ₹{(stats.unpaidBookings * (stats.totalRevenue / (stats.completedJobs || 1))).toFixed(0)}
                </h4>
              </div>
            </Card>
          </div>
        </div>

        {/* Behaviour reports */}
        <div className="mb-20">
          <Card className="bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-3xl overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700">
            <div className="grid md:grid-cols-12">
              {/* Summary */}
              <div className="md:col-span-4 p-12 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account health</h3>
                </div>

                <div className="space-y-10">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">Platform Standing</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{behavioralState.reportCount}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Reports</span>
                    </div>
                  </div>
                  <div className="p-6 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 dark:border-rose-500/20 rounded-3xl group hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all duration-500">
                    <p className="text-rose-600 dark:text-rose-500 text-[10px] font-semibold uppercase tracking-[0.3em] mb-3">Warning level</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-rose-600 dark:text-rose-500 tracking-tighter">{behavioralState.warningCount}</span>
                      <span className="text-[10px] text-rose-500/40 dark:text-rose-500/60 font-black italic uppercase tracking-widest">Critical: 3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed messages */}
              <div className="md:col-span-8 p-12">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] italic">Official Administrative Feed</h4>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                    <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secure Link</span>
                  </div>
                </div>

                {behavioralState.loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : behavioralState.reports.length === 0 ? (
                  <div className="py-24 text-center bg-slate-50/50 dark:bg-white/[0.01] rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                    <div className="w-20 h-20 bg-blue-500/5 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/10 dark:border-blue-500/20 shadow-sm">
                      <svg className="w-10 h-10 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Your profile looks good</p>
                    <p className="text-slate-500 text-xs mt-2 font-medium">No behavioral anomalies detected in current cycle.</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[450px] overflow-y-auto pr-6 custom-scrollbar">
                    {behavioralState.reports.map((report) => (
                      <div key={report._id} className="p-8 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[2rem] group hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-500 hover:border-slate-300 dark:hover:border-white/10">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${report.actionTaken === 'none' ? 'bg-slate-100 dark:bg-slate-500/20 text-slate-500 dark:text-slate-400' :
                            report.actionTaken === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500' :
                              'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-500'
                            }`}>
                            Directive: {report.actionTaken.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-widest">
                            ENTRY: {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                          </span>
                        </div>
                        <div className="relative pl-8 border-l-[3px] border-slate-200 dark:border-white/10 italic text-slate-600 dark:text-slate-300 text-base leading-loose font-medium bg-white/[0.01] p-6 rounded-r-3xl">
                          "{report.adminNotes || 'Internal reference record appended for system stability.'}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* (moved inventory tabs to the top) */}
      </div>
    </div >
=======
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">Provider Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-neutral-300 text-lg">Welcome back, {user?.name}!</p>
        </div>

        {/* Banned Alert */}
        {behavioralState.isBanned && (
          <div className="mb-8 p-6 bg-rose-600 text-white rounded-2xl shadow-xl animate-pulse">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Account Permanently Banned</h2>
                <p className="opacity-90 mt-1">Due to repeated behavioral misconduct, your account has been permanently restricted from offering services.</p>
              </div>
            </div>
          </div>
        )}

        {/* Suspension Alert */}
        {!behavioralState.isBanned && behavioralState.isSuspended && (
          <div className="mb-8 p-6 bg-orange-500 text-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Account Temporarily Suspended</h2>
                <p className="opacity-90 mt-1 flex items-center gap-2">
                  Suspension ends: {new Date(behavioralState.suspensionExpiresAt).toLocaleDateString()} at {new Date(behavioralState.suspensionExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs mt-2 bg-black/10 px-3 py-1.5 rounded-lg inline-block text-white/90">
                  Total Warning Count: <span className="font-bold underline">{behavioralState.warningCount}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conduct Alerts (Warnings) */}
        {!behavioralState.isSuspended && !behavioralState.isBanned && behavioralState.warningCount > 0 && (
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-xl text-amber-600 dark:text-amber-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">Conduct Warning Details</h2>
                <p className="text-amber-800 dark:text-amber-300 mt-1">You have received <span className="font-bold underline">{behavioralState.warningCount} warning(s)</span> for behavioral misconduct. Reaching 3 warnings will trigger a 7-day suspension.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mb-1 font-medium">Total Services</p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-neutral-100">{stats.totalServices}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">Active listings</p>
            </div>
            <Link
              to="/provider/services"
              className="mt-4 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold group transition-colors"
            >
              Manage Services <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </Card>

          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mb-1 font-medium">Pending Requests</p>
              <p className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pendingBookings}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">Awaiting response</p>
            </div>
            <Link
              to="/provider/bookings?status=pending"
              className="mt-4 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold group transition-colors"
            >
              View Requests <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </Card>

          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mb-1 font-medium">Accepted Bookings</p>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{stats.acceptedBookings}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">Scheduled jobs</p>
            </div>
            <Link
              to="/provider/bookings?status=accepted"
              className="mt-4 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold group transition-colors"
            >
              View Bookings <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </Card>

          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mb-1 font-medium">Completed Jobs</p>
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.completedJobs}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">Total: ${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <Link
              to="/provider/completed"
              className="mt-4 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold group transition-colors"
            >
              View Completed <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </Card>
        </div>

      </div>

      {/* Dashboard Main View */}
      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        {/* Performance Chart (CSS based) */}
        <Card className="lg:col-span-2 p-8 bg-slate-900 dark:bg-neutral-900 text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3h-2v10h2V3zm4 8h-2v10h2V11zm-8 4H7v6h2v-6zm10-12h-2v18h2V3z" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Earnings Performance</h3>
                <p className="text-slate-400 dark:text-neutral-400 text-sm mt-1">Monthly revenue trends and service volume</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-400">₹{stats.totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-500 uppercase font-bold tracking-widest mt-1">Total Earned</p>
              </div>
            </div>

            <div className="flex items-end justify-between h-48 gap-3 mt-4">
              {[
                { label: 'Jan', val: 40, color: 'bg-blue-500' },
                { label: 'Feb', val: 65, color: 'bg-indigo-500' },
                { label: 'Mar', val: 35, color: 'bg-purple-500' },
                { label: 'Apr', val: 85, color: 'bg-emerald-500' },
                { label: 'May', val: 55, color: 'bg-blue-400' },
                { label: 'Jun', val: 75, color: 'bg-indigo-400' },
                { label: 'Jul', val: 95, color: 'bg-emerald-400' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <div className="w-full relative flex items-end h-full bg-slate-800 dark:bg-neutral-800 rounded-t-lg overflow-hidden">
                    <div
                      className={`w-full ${bar.color} rounded-t-lg transition-all duration-1000 ease-out group-hover/bar:brightness-110 shadow-lg shadow-emerald-500/10`}
                      style={{ height: `${bar.val}%` }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {bar.val}%
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-tighter">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Metrics */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-xl flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Avg. Per Job</p>
              <h4 className="text-3xl font-black">₹{stats.completedJobs > 0 ? (stats.totalRevenue / stats.completedJobs).toFixed(1) : '0'}</h4>
              <p className="text-[10px] text-indigo-200 mt-1 uppercase font-bold">Standard rate</p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-neutral-800 dark:border-neutral-700 border-none shadow-xl flex items-center gap-6 group hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 dark:text-neutral-300 text-sm font-medium">Clearance Rate</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-neutral-100">{stats.totalServices > 0 ? Math.round((stats.completedJobs / (stats.acceptedBookings + stats.completedJobs || 1)) * 100) : '0'}%</h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 uppercase font-bold">Excellent Standing</p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-neutral-800 dark:border-neutral-700 border-none shadow-xl flex items-center gap-6 group hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors text-right justify-end">
            <div>
              <p className="text-slate-500 dark:text-neutral-300 text-sm font-medium">Pending Release</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-neutral-100">₹{(stats.unpaidBookings * (stats.totalRevenue / (stats.completedJobs || 1))).toFixed(0)}</h4>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 uppercase font-bold">Locked in escrow</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors order-first">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </Card>
        </div>
      </div>

      {/* Behavioral Conduct & Notices Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="md:col-span-1 p-6 border-rose-100 dark:border-rose-800 dark:bg-neutral-800 dark:border-neutral-700">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Conduct Standing
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">Tracking professional behavior and customer reports.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-neutral-700/50 rounded-xl border border-slate-200 dark:border-neutral-600">
              <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase mb-1">Reports Received</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-neutral-100">{behavioralState.reportCount}</p>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mb-1">Total lifetime</p>
              </div>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-xl border border-rose-100 dark:border-rose-800">
              <p className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase mb-1">Active Warnings</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{behavioralState.warningCount}</p>
                <p className="text-xs text-rose-400 dark:text-rose-500 mb-1">3 = Suspension | 5 = Ban</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Conduct Notices & Messages
          </h3>

          {behavioralState.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : behavioralState.reports.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 dark:bg-neutral-700/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-600">
              <svg className="w-12 h-12 text-slate-300 dark:text-neutral-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-slate-500 dark:text-neutral-300 font-medium font-display">No conduct issues reported</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Your professional standing is excellent!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {behavioralState.reports.map((report) => (
                <div key={report._id} className="p-4 bg-slate-50 dark:bg-neutral-700/50 border border-slate-200 dark:border-neutral-600 rounded-xl hover:bg-white dark:hover:bg-neutral-700 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${report.actionTaken === 'none' ? 'bg-slate-200 dark:bg-neutral-600 text-slate-600 dark:text-neutral-300' :
                      report.actionTaken === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                      }`}>
                      Action: {report.actionTaken.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-neutral-200 mb-2 uppercase">Official Admin Message:</p>
                  <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed italic bg-white dark:bg-neutral-800 p-3 rounded-lg border border-slate-100 dark:border-neutral-600">
                    "{report.adminNotes || 'No specific notes provided by admin.'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/provider/services/add" className="group">
          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-1">Add New Service</h3>
                <p className="text-slate-600 dark:text-neutral-300 text-sm leading-relaxed">Create a new service offering</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/provider/services" className="group">
          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-1">My Services</h3>
                <p className="text-slate-600 dark:text-neutral-300 text-sm leading-relaxed">Manage your service offerings</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/provider/bookings" className="group">
          <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-1">Booking Requests</h3>
                <p className="text-slate-600 dark:text-neutral-300 text-sm leading-relaxed">View and respond to bookings</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
  );
};

export default ProviderDashboard;
