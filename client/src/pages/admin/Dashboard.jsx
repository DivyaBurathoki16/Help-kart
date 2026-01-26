import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PrimaryButton from '../../components/ui/PrimaryButton';
import AdminMessages from '../../components/Admin/AdminMessages';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import AdminContent from '../../components/Admin/AdminContent';
import { getApiUrl } from '../../config/api';
import API_URL from '../../config/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [resolution, setResolution] = useState('redo');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'behavior', 'messages', 'content', 'reviews', 'services'
  const [behaviorReports, setBehaviorReports] = useState([]);
  const [reviewModal, setReviewModal] = useState(null); // { report }
  const [reviewAction, setReviewAction] = useState('none');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deleteReviewModal, setDeleteReviewModal] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [togglingService, setTogglingService] = useState(null);
  const [serviceSubTab, setServiceSubTab] = useState('active'); // 'active', 'deactivated', 'removed'
  const [removingService, setRemovingService] = useState(null);
  const [restoringService, setRestoringService] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
    fetchBehaviorReports();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('api/admin/issues'));
      setIssues(response.data.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      alert('Failed to fetch issues');
    } finally {
      if (activeTab === 'issues') setLoading(false);
    }
  };

  const fetchBehaviorReports = async () => {
    try {
      const response = await axios.get(getApiUrl('api/behavior-reports'));
      setBehaviorReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching behavior reports:', error);
    } finally {
      if (activeTab === 'behavior') setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(getApiUrl('api/admin/reviews'));
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Failed to fetch reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await axios.get(getApiUrl('api/admin/services'));
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Failed to fetch services');
    } finally {
      setServicesLoading(false);
    }
  };

  const handleToggleService = async (serviceId) => {
    try {
      setTogglingService(serviceId);
      const response = await axios.patch(getApiUrl(`api/admin/services/${serviceId}/toggle`));

      // Update the service in the list
      setServices(prev => prev.map(service =>
        service._id === serviceId ? response.data.service : service
      ));

      alert(response.data.message || 'Service status updated successfully');
    } catch (error) {
      console.error('Error toggling service:', error);
      alert(error.response?.data?.message || 'Failed to toggle service status');
    } finally {
      setTogglingService(null);
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (!confirm('Are you sure you want to remove this service? It will be moved to the Removed tab.')) {
      return;
    }

    try {
      setRemovingService(serviceId);
      const response = await axios.patch(getApiUrl(`api/admin/services/${serviceId}/remove`));

      // Update the service in the list
      setServices(prev => prev.map(service =>
        service._id === serviceId ? response.data.service : service
      ));

      alert(response.data.message || 'Service removed successfully');
    } catch (error) {
      console.error('Error removing service:', error);
      alert(error.response?.data?.message || 'Failed to remove service');
    } finally {
      setRemovingService(null);
    }
  };

  const handleRestoreService = async (serviceId) => {
    try {
      setRestoringService(serviceId);
      const response = await axios.patch(getApiUrl(`api/admin/services/${serviceId}/restore`));

      // Update the service in the list
      setServices(prev => prev.map(service =>
        service._id === serviceId ? response.data.service : service
      ));

      alert(response.data.message || 'Service restored successfully');
    } catch (error) {
      console.error('Error restoring service:', error);
      alert(error.response?.data?.message || 'Failed to restore service');
    } finally {
      setRestoringService(null);
    }
  };

  const handleDeleteReviewClick = (review) => {
    setDeleteReviewModal(review);
  };

  const handleConfirmDeleteReview = async () => {
    if (!deleteReviewModal) return;

    try {
      setDeletingReview(true);
      const response = await axios.delete(getApiUrl(`api/admin/reviews/${deleteReviewModal._id}`));
      setReviews((prev) => prev.filter((r) => r._id !== deleteReviewModal._id));
      setDeleteReviewModal(null);
      alert(response.data.message || 'Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingReview(false);
    }
  };

  const handleReviewClick = (report) => {
    setReviewModal(report);
    setReviewAction('none');
    setReviewNotes('');
  };

  const handleReviewReport = async () => {
    if (!reviewModal) return;

    try {
      setReviewing(true);
      await axios.patch(getApiUrl(`api/behavior-reports/${reviewModal._id}/review`), {
        actionTaken: reviewAction,
        adminNotes: reviewNotes.trim(),
      });

      setReviewModal(null);
      fetchBehaviorReports();
      alert('Report reviewed successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to review report');
    } finally {
      setReviewing(false);
    }
  };

  const handleResolveClick = (issue) => {
    setResolveModal(issue);
    setResolution('redo');
    setRefundAmount('');
    setAdminNotes('');
  };

  const handleResolveIssue = async () => {
    if (!resolveModal) return;

    if (resolution === 'partial_refund' && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      alert('Please enter a valid refund amount for partial refund');
      return;
    }

    try {
      setResolving(true);
      const response = await axios.patch(
        getApiUrl(`api/admin/issues/${resolveModal._id}/resolve`),
        {
          decision: resolution,
          refundAmount: resolution === 'partial_refund' ? parseFloat(refundAmount) : undefined,
          notes: adminNotes.trim() || undefined,
        }
      );

      setResolveModal(null);
      setResolution('redo');
      setRefundAmount('');
      setAdminNotes('');
      fetchIssues();
      alert(response.data.message || 'Issue resolved successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve issue');
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getIssueTypeLabel = (type) => {
    const labels = {
      poor_quality: 'Poor Quality',
      incomplete: 'Incomplete Work',
      damage: 'Damage Caused',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const pendingIssues = issues.filter(issue => issue.status === 'issue_reported');
  const redoRequired = issues.filter(issue => issue.status === 'redo_required');
  const refundPending = issues.filter(issue => issue.status === 'refund_pending');
  const pendingBehaviorReports = behaviorReports.filter(r => r.status === 'pending');

  const getBehaviorIssueLabel = (type) => {
    const labels = {
      rude_behavior: 'Rude Behavior',
      verbal_abuse: 'Verbal Abuse',
      unprofessional_conduct: 'Unprofessional Conduct',
      harassment: 'Harassment',
      etiquette_violation: 'Etiquette Violation',
    };
    return labels[type] || type;
  };

  // Filtering Logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      (issue.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.provider?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.service?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesType = typeFilter === 'all' || issue.issueType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredBehaviorReports = behaviorReports.filter(report => {
    const matchesSearch =
      (report.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.provider?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.issueType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      (review.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.provider?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.service?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      {/* Admin Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">Welcome back, {user?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-500/30">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1.5 animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card hover={false} className="p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{pendingIssues.length}</div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">Pending Issues</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">Awaiting review</p>
            </div>
          </Card>

          <Card hover={false} className="p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{redoRequired.length}</div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">Redo Required</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">Providers acting</p>
            </div>
          </Card>

          <Card hover={false} className="p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{refundPending.length}</div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">Refunds Pending</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">Processing refunds</p>
            </div>
          </Card>

          <Card hover={false} className="p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20 dark:from-neutral-600 dark:to-neutral-700">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{issues.length}</div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">Total Issues</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">All time</p>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card hover={false} className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by customer, provider or service..."
                className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-neutral-200 min-w-[140px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {activeTab === 'issues' ? (
                  <>
                    <option value="issue_reported">Pending</option>
                    <option value="redo_required">Redo Required</option>
                    <option value="refund_pending">Refund Pending</option>
                    <option value="resolved">Resolved</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="action_taken">Action Taken</option>
                  </>
                )}
              </select>
              <select
                className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-neutral-200 min-w-[140px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {activeTab === 'issues' ? (
                  <>
                    <option value="poor_quality">Poor Quality</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="damage">Damage</option>
                    <option value="other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="rude_behavior">Rude Behavior</option>
                    <option value="verbal_abuse">Verbal Abuse</option>
                    <option value="unprofessional_conduct">Unprofessional</option>
                    <option value="harassment">Harassment</option>
                    <option value="etiquette_violation">Etiquette</option>
                  </>
                )}
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="p-3 bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-all border border-slate-200 dark:border-neutral-700"
                title="Clear Filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 dark:bg-neutral-800/80 rounded-2xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('issues')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'issues'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Issues
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md text-xs">{issues.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('behavior')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'behavior'
                ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Behavior
              {pendingBehaviorReports.length > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-md text-xs animate-pulse">{pendingBehaviorReports.length}</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('reviews');
                if (!reviews.length) fetchReviews();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reviews'
                ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Reviews
            </button>
            <button
              onClick={() => {
                setActiveTab('services');
                if (!services.length) fetchServices();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'services'
                ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Services
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'messages'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Messages
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'content'
                ? 'bg-white dark:bg-neutral-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Site Content
            </button>
          </div>
        </div>

        {/* Content based on tab */}
        {activeTab === 'messages' ? (
          <Card className="p-6" hover={false}>
            <AdminMessages />
          </Card>
        ) : activeTab === 'content' ? (
          <Card className="p-6" hover={false}>
            <AdminContent />
          </Card>
        ) : activeTab === 'issues' ? (
          <Card className="p-6" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Issue Reports</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Review and resolve customer service issues</p>
              </div>
              <PrimaryButton onClick={fetchIssues} variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </PrimaryButton>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-neutral-700 border-t-blue-600 dark:border-t-blue-400 animate-spin mx-auto"></div>
                <p className="mt-4 text-sm text-slate-500 dark:text-neutral-400">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-neutral-300 font-semibold">No matching issues found</p>
                <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div key={issue._id} className="p-5 rounded-xl bg-slate-50/50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-700/50 hover:border-slate-300 dark:hover:border-neutral-600 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {issue.service?.title || 'Service'}
                              </h3>
                              <StatusBadge status={issue.status} showDot size="sm" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Customer:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{issue.customer?.name || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Provider:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{issue.provider?.businessName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Amount:</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">₹{issue.totalAmount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Type:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{getIssueTypeLabel(issue.issueType)}</span>
                              </div>
                              <div className="flex items-center gap-2 md:col-span-2">
                                <span className="text-slate-500 dark:text-neutral-500">Reported:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{formatDate(issue.issueReportedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Issue Description */}
                        {issue.issueDescription && (
                          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5">Issue Description</p>
                            <p className="text-sm text-amber-900 dark:text-amber-200">{issue.issueDescription}</p>
                          </div>
                        )}

                        {/* Proof Images Grid */}
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-2">Provider's Proof</p>
                            {issue.proofOfWork && issue.proofOfWork.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {issue.proofOfWork.map((image, index) => (
                                  <img
                                    key={index}
                                    src={`${API_URL}${image}`}
                                    alt={`Proof ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                                    onClick={() => window.open(`${API_URL}${image}`, '_blank')}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 dark:text-neutral-500 italic">No proof uploaded</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-2">Customer's Evidence</p>
                            {issue.customerProof && issue.customerProof.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {issue.customerProof.map((image, index) => (
                                  <img
                                    key={index}
                                    src={`${API_URL}${image}`}
                                    alt={`Evidence ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                                    onClick={() => window.open(`${API_URL}${image}`, '_blank')}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 dark:text-neutral-500 italic">No evidence uploaded</p>
                            )}
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {issue.adminNotes && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5">Admin Notes</p>
                            <p className="text-sm text-blue-900 dark:text-blue-200">{issue.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {issue.status === 'issue_reported' && (
                        <div className="lg:flex-shrink-0">
                          <PrimaryButton
                            onClick={() => handleResolveClick(issue)}
                            size="sm"
                            className="w-full lg:w-auto"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            }
                            iconPosition="left"
                          >
                            Resolve Issue
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : activeTab === 'behavior' ? (
          <Card className="p-6" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Behavioral Misconduct Reports</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Review reports of provider behavioral issues</p>
              </div>
              <PrimaryButton onClick={fetchBehaviorReports} variant="danger" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </PrimaryButton>
            </div>

            {!loading && filteredBehaviorReports.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-neutral-300 font-semibold">No behavioral reports found</p>
                <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">All providers are behaving well!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBehaviorReports.map((report) => (
                  <div key={report._id} className="p-5 rounded-xl bg-rose-50/30 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/30 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <StatusBadge status={report.status} showDot size="sm" />
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 px-2.5 py-1 bg-rose-100 dark:bg-rose-500/10 rounded-lg border border-rose-200 dark:border-rose-500/30">
                            {getBehaviorIssueLabel(report.issueType)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-2 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-neutral-500">Customer:</span>
                            <span className="font-medium text-slate-700 dark:text-neutral-300">{report.customer?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-neutral-500">Provider:</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">{report.provider?.businessName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-neutral-500">Reported:</span>
                            <span className="font-medium text-slate-700 dark:text-neutral-300">{formatDate(report.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-neutral-500">Action:</span>
                            <span className={`font-semibold ${report.actionTaken === 'none' ? 'text-slate-400 dark:text-neutral-500' : 'text-rose-600 dark:text-rose-400'}`}>
                              {report.actionTaken.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800">
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Description</p>
                          <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">{report.description}</p>
                        </div>

                        {report.adminNotes && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-200 dark:border-blue-500/20">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5">Admin Notes</p>
                            <p className="text-sm text-blue-900 dark:text-blue-200">{report.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex-shrink-0">
                          <PrimaryButton
                            onClick={() => handleReviewClick(report)}
                            variant="danger"
                            size="sm"
                            className="w-full lg:w-auto"
                          >
                            Review & Action
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : activeTab === 'reviews' ? (
          <Card className="p-6" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Reviews</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">View and manage customer reviews across all services</p>
              </div>
              <PrimaryButton onClick={fetchReviews} variant="warning" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </PrimaryButton>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-neutral-700 border-t-amber-500 animate-spin mx-auto"></div>
                <p className="mt-4 text-sm text-slate-500 dark:text-neutral-400">Loading reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-neutral-300 font-semibold">No reviews found</p>
                <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="p-5 rounded-xl bg-amber-50/30 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/30 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {review.service?.title || 'Service'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
                              By <span className="font-medium text-slate-700 dark:text-neutral-300">{review.customer?.name || 'Customer'}</span> on <span className="font-medium text-slate-700 dark:text-neutral-300">{review.provider?.businessName || 'Provider'}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 px-2 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-700">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-neutral-700'}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-sm text-slate-700 dark:text-neutral-300 mb-3 italic">
                            "{review.comment}"
                          </p>
                        )}

                        <p className="text-xs text-slate-400 dark:text-neutral-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex flex-row lg:flex-col gap-2 items-center lg:items-end">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${review.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${review.isApproved ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {review.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <button
                          onClick={() => handleDeleteReviewClick(review)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : activeTab === 'services' ? (
          <Card className="p-6" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Management</h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">View and manage all services across the platform</p>
              </div>
              <PrimaryButton onClick={fetchServices} variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </PrimaryButton>
            </div>

            {/* Service Subtabs */}
            <div className="flex gap-2 p-1 bg-slate-100/80 dark:bg-neutral-800/80 rounded-xl mb-6">
              <button
                onClick={() => setServiceSubTab('active')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${serviceSubTab === 'active'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active
                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-xs">{services.filter(s => s.isActive && !s.isRemoved).length}</span>
              </button>
              <button
                onClick={() => setServiceSubTab('deactivated')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${serviceSubTab === 'deactivated'
                  ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Deactivated
                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-xs">{services.filter(s => !s.isActive && !s.isRemoved).length}</span>
              </button>
              <button
                onClick={() => setServiceSubTab('removed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${serviceSubTab === 'removed'
                  ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Removed
                <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded text-xs">{services.filter(s => s.isRemoved).length}</span>
              </button>
            </div>

            {servicesLoading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-neutral-700 border-t-purple-600 dark:border-t-purple-400 animate-spin mx-auto"></div>
                <p className="mt-4 text-sm text-slate-500 dark:text-neutral-400">Loading services...</p>
              </div>
            ) : services.filter(s => {
              if (serviceSubTab === 'active') return s.isActive && !s.isRemoved;
              if (serviceSubTab === 'deactivated') return !s.isActive && !s.isRemoved;
              if (serviceSubTab === 'removed') return s.isRemoved;
              return false;
            }).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-neutral-300 font-semibold">
                  No {serviceSubTab} services found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.filter(s => {
                  if (serviceSubTab === 'active') return s.isActive && !s.isRemoved;
                  if (serviceSubTab === 'deactivated') return !s.isActive && !s.isRemoved;
                  if (serviceSubTab === 'removed') return s.isRemoved;
                  return false;
                }).map((service) => (
                  <div key={service._id} className="p-5 rounded-xl bg-purple-50/30 dark:bg-purple-500/5 border border-purple-200/50 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {service.title}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${service.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {service.category && (
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-lg text-xs font-medium">
                                  {service.category.name}
                                </span>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Provider:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{service.provider?.businessName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Price:</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">₹{service.price}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Duration:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{service.duration} min</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-neutral-500">Created:</span>
                                <span className="font-medium text-slate-700 dark:text-neutral-300">{new Date(service.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {service.description && (
                          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-3 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex flex-row lg:flex-col gap-2 items-center lg:items-end">
                        {service.isRemoved ? (
                          // Removed services - show Restore button
                          <button
                            onClick={() => handleRestoreService(service._id)}
                            disabled={restoringService === service._id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {restoringService === service._id ? (
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                            Restore
                          </button>
                        ) : (
                          // Active or Deactivated services - show Toggle and Remove buttons
                          <>
                            <button
                              onClick={() => handleToggleService(service._id)}
                              disabled={togglingService === service._id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${service.isActive
                                ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                }`}
                            >
                              {togglingService === service._id ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : service.isActive ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {service.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleRemoveService(service._id)}
                              disabled={removingService === service._id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {removingService === service._id ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </div>

      {/* Resolve Issue Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8 shadow-2xl" hover={false}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resolve Issue</h2>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Choose resolution type</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setResolveModal(null);
                    setResolution('redo');
                    setRefundAmount('');
                    setAdminNotes('');
                  }}
                  className="p-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                  disabled={resolving}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-900/50 rounded-xl p-4 mb-6 border border-slate-200/80 dark:border-neutral-700/50">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-neutral-400">Service</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{resolveModal.service?.title || 'Service'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-neutral-400">Customer</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{resolveModal.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-neutral-700">
                    <span className="text-slate-500 dark:text-neutral-400">Total Amount</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{resolveModal.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Evidence Comparison */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Provider Proof */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-neutral-100 mb-2 text-center">Provider's Proof</h3>
                  {resolveModal.proofOfWork && resolveModal.proofOfWork.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {resolveModal.proofOfWork.map((img, i) => (
                        <img key={i} src={`${API_URL}${img}`} alt="Proof" className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer hover:opacity-90" onClick={() => window.open(`${API_URL}${img}`, '_blank')} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-neutral-800 h-24 rounded-lg flex items-center justify-center border border-slate-200 dark:border-neutral-700 text-slate-400 dark:text-neutral-500 text-sm">
                      No proof uploaded
                    </div>
                  )}
                </div>

                {/* Customer Evidence */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-neutral-100 mb-2 text-center">Customer's Evidence</h3>
                  {resolveModal.customerProof && resolveModal.customerProof.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {resolveModal.customerProof.map((img, i) => (
                        <img key={i} src={`${API_URL}${img}`} alt="Evidence" className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer hover:opacity-90" onClick={() => window.open(`${API_URL}${img}`, '_blank')} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-neutral-800 h-24 rounded-lg flex items-center justify-center border border-slate-200 dark:border-neutral-700 text-slate-400 dark:text-neutral-500 text-sm">
                      No evidence uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Type */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Resolution Type
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${resolution === 'redo'
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                    }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value="redo"
                      checked={resolution === 'redo'}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-300 dark:border-neutral-600 focus:ring-blue-500 focus:ring-offset-0"
                      disabled={resolving}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">Require Redo</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Provider must redo the service</div>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${resolution === 'partial_refund'
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                    }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value="partial_refund"
                      checked={resolution === 'partial_refund'}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-300 dark:border-neutral-600 focus:ring-blue-500 focus:ring-offset-0"
                      disabled={resolving}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">Partial Refund</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Refund a portion of the amount</div>
                      {resolution === 'partial_refund' && (
                        <div className="mt-3">
                          <input
                            type="number"
                            min="0"
                            max={resolveModal.totalAmount}
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder="Enter refund amount"
                            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100"
                            disabled={resolving}
                          />
                          <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Max: ₹{resolveModal.totalAmount}</p>
                        </div>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${resolution === 'full_refund'
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                    }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value="full_refund"
                      checked={resolution === 'full_refund'}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-0.5 mr-3 w-4 h-4 text-blue-600 border-slate-300 dark:border-neutral-600 focus:ring-blue-500 focus:ring-offset-0"
                      disabled={resolving}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">Full Refund</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Refund full amount (₹{resolveModal.totalAmount})</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label htmlFor="adminNotes" className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="adminNotes"
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this resolution..."
                  className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 transition-all resize-none"
                  disabled={resolving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <button
                  onClick={() => {
                    setResolveModal(null);
                    setResolution('redo');
                    setRefundAmount('');
                    setAdminNotes('');
                  }}
                  disabled={resolving}
                  className="flex-1 px-5 py-2.5 text-sm border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleResolveIssue}
                  disabled={resolving || (resolution === 'partial_refund' && (!refundAmount || parseFloat(refundAmount) <= 0))}
                  className="flex-1"
                  size="md"
                  icon={
                    resolving ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  }
                  iconPosition="left"
                >
                  {resolving ? 'Resolving...' : 'Confirm Resolution'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Review Behavior Report Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-xl w-full my-8 shadow-2xl" hover={false}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Conduct</h2>
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{reviewModal.provider?.businessName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModal(null)}
                  className="p-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                <div className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">{getBehaviorIssueLabel(reviewModal.issueType)}</p>
                  <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed italic">"{reviewModal.description}"</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Disciplinary Action</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { val: 'none', label: 'No Action (Dismiss)', desc: 'Close without action' },
                      { val: 'warning', label: 'Issue Warning', desc: 'Add warning to record' },
                      { val: 'temporary_suspension', label: 'Suspend Account', desc: '7 day suspension' },
                      { val: 'permanent_ban', label: 'Permanent Ban', desc: 'Remove from platform' },
                    ].map((opt) => (
                      <label key={opt.val} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${reviewAction === opt.val
                        ? 'border-rose-500 dark:border-rose-500 bg-rose-50 dark:bg-rose-500/10 shadow-sm'
                        : 'border-slate-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-600 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                        }`}>
                        <input
                          type="radio"
                          name="reviewAction"
                          value={opt.val}
                          checked={reviewAction === opt.val}
                          onChange={(e) => setReviewAction(e.target.value)}
                          className="mr-3 w-4 h-4 text-rose-600 border-slate-300 dark:border-neutral-600 focus:ring-rose-500 focus:ring-offset-0"
                        />
                        <div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Resolution Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter notes about the decision..."
                    className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Note: These notes may be visible to the customer</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800">
                <button
                  onClick={() => setReviewModal(null)}
                  className="flex-1 px-5 py-2.5 text-sm border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleReviewReport}
                  disabled={reviewing}
                  variant="danger"
                  size="md"
                  className="flex-1"
                >
                  {reviewing ? 'Processing...' : 'Submit Decision'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Review Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteReviewModal}
        onClose={() => setDeleteReviewModal(null)}
        onConfirm={handleConfirmDeleteReview}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This action cannot be undone."
        isLoading={deletingReview}
      />
    </div>
  );
};

export default AdminDashboard;
