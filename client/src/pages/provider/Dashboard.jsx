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
    monthlyRevenue: [], // { label, value } per recent month
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

  const hasMonthlyRevenue = stats.monthlyRevenue && stats.monthlyRevenue.some((m) => m.value > 0);
  const maxMonthlyRevenue = hasMonthlyRevenue
    ? Math.max(...stats.monthlyRevenue.map((m) => m.value))
    : 0;

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
        monthlyRevenue: monthBuckets,
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
  );
};

export default ProviderDashboard;
