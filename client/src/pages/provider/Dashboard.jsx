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
                <p className="text-3xl font-black text-emerald-400">${stats.totalRevenue.toFixed(0)}</p>
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
              <h4 className="text-3xl font-black">${stats.completedJobs > 0 ? (stats.totalRevenue / stats.completedJobs).toFixed(1) : '0'}</h4>
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
              <h4 className="text-3xl font-black text-slate-900 dark:text-neutral-100">${(stats.unpaidBookings * (stats.totalRevenue / (stats.completedJobs || 1))).toFixed(0)}</h4>
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
  );
};

export default ProviderDashboard;
