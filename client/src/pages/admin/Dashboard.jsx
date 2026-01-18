import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PrimaryButton from '../../components/ui/PrimaryButton';
import AdminMessages from '../../components/Admin/AdminMessages';
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
  const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'behavior', or 'messages'
  const [behaviorReports, setBehaviorReports] = useState([]);
  const [reviewModal, setReviewModal] = useState(null); // { report }
  const [reviewAction, setReviewAction] = useState('none');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-neutral-400 text-lg">Welcome back, {user?.name}!</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-amber-500 dark:bg-neutral-800 dark:border-amber-400">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingIssues.length}</div>
            <div className="text-slate-600 dark:text-neutral-300 mt-1 font-bold text-xs uppercase tracking-wider">Pending Issues</div>
            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">Awaiting manual review</p>
          </Card>
          <Card className="p-6 border-l-4 border-blue-500 dark:bg-neutral-800 dark:border-blue-400">
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{redoRequired.length}</div>
            <div className="text-slate-600 dark:text-neutral-300 mt-1 font-bold text-xs uppercase tracking-wider">Redo Required</div>
            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">Providers taking action</p>
          </Card>
          <Card className="p-6 border-l-4 border-purple-500 dark:bg-neutral-800 dark:border-purple-400">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{refundPending.length}</div>
            <div className="text-slate-600 dark:text-neutral-300 mt-1 font-bold text-xs uppercase tracking-wider">Refunds Pending</div>
            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">Money back to customers</p>
          </Card>
          <Card className="p-6 border-l-4 border-slate-500 dark:bg-neutral-800 dark:border-neutral-500">
            <div className="text-3xl font-extrabold text-slate-700 dark:text-neutral-300">{issues.length}</div>
            <div className="text-slate-600 dark:text-neutral-300 mt-1 font-bold text-xs uppercase tracking-wider">Total Lifetime</div>
            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">Cumulative issue count</p>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 mb-8 bg-slate-900 dark:bg-neutral-800 text-white border-none shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by customer, provider or service..."
                className="w-full bg-slate-800 dark:bg-neutral-700 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 text-white dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="bg-slate-800 dark:bg-neutral-700 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 text-slate-200 dark:text-neutral-200"
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
                className="bg-slate-800 dark:bg-neutral-700 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 text-slate-200 dark:text-neutral-200"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Issue Types</option>
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
                className="p-3 bg-slate-800 dark:bg-neutral-700 text-slate-400 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100 rounded-xl transition-colors"
                title="Clear Filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-neutral-700 mb-8">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'issues'
              ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
              }`}
          >
            Service Issues ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'behavior'
              ? 'border-b-2 border-rose-600 dark:border-rose-400 text-rose-600 dark:text-rose-400'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
              }`}
          >
            Behavioral Reports ({behaviorReports.length})
            {pendingBehaviorReports.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs rounded-full">
                {pendingBehaviorReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'messages'
              ? 'border-b-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
              }`}
          >
            Contact Messages
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'messages' ? (
          <Card className="p-6">
            <AdminMessages />
          </Card>
        ) : activeTab === 'issues' ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Customer Issue Reports</h2>
                <p className="text-slate-600 dark:text-neutral-400 mt-1">Review and resolve customer service issues</p>
              </div>
              <PrimaryButton onClick={fetchIssues} variant="outline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </PrimaryButton>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-neutral-400">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-300 dark:text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-slate-600 dark:text-neutral-400 text-lg">No matching issues found</p>
                <p className="text-slate-500 dark:text-neutral-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <Card key={issue._id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                                {issue.service?.title || 'Service'}
                              </h3>
                              <StatusBadge status={issue.status} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-neutral-400">
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">Customer:</span>{' '}
                                {issue.customer?.name || 'N/A'} ({issue.customer?.email || 'N/A'})
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">Provider:</span>{' '}
                                {issue.provider?.businessName || 'N/A'}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">Booking Amount:</span>{' '}
                                <span className="text-blue-600 dark:text-blue-400 font-bold">₹{issue.totalAmount}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">Issue Type:</span>{' '}
                                {getIssueTypeLabel(issue.issueType)}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-neutral-100">Reported:</span>{' '}
                                {formatDate(issue.issueReportedAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Issue Description */}
                        {issue.issueDescription && (
                          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">Issue Description:</p>
                            <p className="text-sm text-amber-800 dark:text-amber-300">{issue.issueDescription}</p>
                          </div>
                        )}

                        {/* Provider's Proof */}
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100 mb-2">Provider's Proof of Work:</p>
                          {issue.proofOfWork && issue.proofOfWork.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                              {issue.proofOfWork.map((image, index) => (
                                <img
                                  key={index}
                                  src={`${API_URL}${image}`}
                                  alt={`Proof ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer hover:opacity-75"
                                  onClick={() => window.open(`${API_URL}${image}`, '_blank')}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-neutral-500 italic">No proof of work uploaded by provider.</p>
                          )}
                        </div>

                        {/* Issue Images */}
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100 mb-2">Customer's Issue Evidence:</p>
                          {issue.customerProof && issue.customerProof.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                              {issue.customerProof.map((image, index) => (
                                <img
                                  key={index}
                                  src={`${API_URL}${image}`}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-neutral-700 cursor-pointer hover:opacity-75"
                                  onClick={() => window.open(`${API_URL}${image}`, '_blank')}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-neutral-500 italic">No evidence photos uploaded by customer.</p>
                          )}
                        </div>

                        {/* Admin Notes */}
                        {issue.adminNotes && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Admin Notes:</p>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{issue.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {issue.status === 'issue_reported' && (
                        <div className="lg:text-right">
                          <PrimaryButton
                            onClick={() => handleResolveClick(issue)}
                            variant="outline"
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
                  </Card>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 text-rose-600 dark:text-rose-400">Behavioral Misconduct Reports</h2>
                <p className="text-slate-600 dark:text-neutral-400 mt-1 font-display">Review reports of provider behavioral issues</p>
              </div>
              <PrimaryButton onClick={fetchBehaviorReports} className="bg-rose-600 hover:bg-rose-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </PrimaryButton>
            </div>

            {!loading && filteredBehaviorReports.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-emerald-300 dark:text-emerald-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-slate-600 dark:text-neutral-400 text-lg">No matching behavioral reports</p>
                <p className="text-slate-500 dark:text-neutral-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBehaviorReports.map((report) => (
                  <Card key={report._id} className="p-6 border-rose-100 dark:border-rose-900/50 hover:border-rose-200 dark:hover:border-rose-800 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${report.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : report.status === 'reviewed'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            }`}>
                            {report.status.replace('_', ' ')}
                          </span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold px-3 py-1 bg-rose-50 dark:bg-rose-900/50 rounded-lg text-xs">
                            {getBehaviorIssueLabel(report.issueType)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-slate-500 dark:text-neutral-400 font-medium">Customer</p>
                            <p className="font-bold text-slate-800 dark:text-neutral-200">{report.customer?.name} ({report.customer?.email})</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-neutral-400 font-medium">Provider</p>
                            <p className="font-bold text-rose-700 dark:text-rose-400">{report.provider?.businessName}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-neutral-400 font-medium">Reported On</p>
                            <p className="font-bold text-slate-800 dark:text-neutral-200">{formatDate(report.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-neutral-400 font-medium">Action Taken</p>
                            <p className={`font-bold uppercase ${report.actionTaken === 'none' ? 'text-slate-400 dark:text-neutral-500' : 'text-rose-600 dark:text-rose-400'}`}>
                              {report.actionTaken.replace('_', ' ')}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                          <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase mb-2">Description</p>
                          <p className="text-slate-700 dark:text-neutral-300 leading-relaxed text-sm">{report.description}</p>
                        </div>

                        {report.adminNotes && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-2">Admin Resolution Notes</p>
                            <p className="text-blue-800 dark:text-blue-300 text-sm">{report.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex-shrink-0">
                          <PrimaryButton
                            onClick={() => handleReviewClick(report)}
                            className="bg-rose-600 hover:bg-rose-700 w-full lg:w-auto"
                          >
                            Review & Action
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Resolve Issue Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Resolve Issue</h2>
                  <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">Choose resolution: Redo service or Process refund</p>
                </div>
                <button
                  onClick={() => {
                    setResolveModal(null);
                    setResolution('redo');
                    setRefundAmount('');
                    setAdminNotes('');
                  }}
                  className="text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
                  disabled={resolving}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Booking Summary */}
              <div className="bg-slate-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 border border-slate-200 dark:border-neutral-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-neutral-400">Service:</span>
                    <span className="font-semibold text-slate-900 dark:text-neutral-100">{resolveModal.service?.title || 'Service'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-neutral-400">Customer:</span>
                    <span className="font-semibold text-slate-900 dark:text-neutral-100">{resolveModal.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-neutral-400">Total Amount:</span>
                    <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">₹{resolveModal.totalAmount}</span>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-3">
                  Resolution Type <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <div className="space-y-3">
                  <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${resolution === 'redo'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-neutral-800'
                    }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value="redo"
                      checked={resolution === 'redo'}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={resolving}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-neutral-100 mb-1">🔁 Require Redo</div>
                      <div className="text-sm text-slate-600 dark:text-neutral-400">Provider must redo the service to fix the issue</div>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${resolution === 'partial_refund'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-neutral-800'
                    }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value="partial_refund"
                      checked={resolution === 'partial_refund'}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={resolving}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-neutral-100 mb-1">💰 Partial Refund</div>
                      <div className="text-sm text-slate-600 dark:text-neutral-400">Refund a portion of the booking amount</div>
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
                            className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100"
                            disabled={resolving}
                          />
                          <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">Maximum: ₹{resolveModal.totalAmount}</p>
                        </div>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${resolution === 'full_refund'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-neutral-800'
                    }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value="full_refund"
                      checked={resolution === 'full_refund'}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={resolving}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-neutral-100 mb-1">💵 Full Refund</div>
                      <div className="text-sm text-slate-600 dark:text-neutral-400">Refund the full booking amount (₹{resolveModal.totalAmount})</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label htmlFor="adminNotes" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="adminNotes"
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any internal notes about this resolution..."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 transition-all duration-300 resize-none"
                  disabled={resolving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResolveModal(null);
                    setResolution('redo');
                    setRefundAmount('');
                    setAdminNotes('');
                  }}
                  disabled={resolving}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleResolveIssue}
                  disabled={resolving || (resolution === 'partial_refund' && (!refundAmount || parseFloat(refundAmount) <= 0))}
                  className="flex-1"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-xl w-full my-8">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-1">Review Behavioral Conduct</h2>
                  <p className="text-sm text-slate-600 dark:text-neutral-400">Provider: <span className="font-bold text-rose-600 dark:text-rose-400">{reviewModal.provider?.businessName}</span></p>
                </div>
                <button
                  onClick={() => setReviewModal(null)}
                  className="text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl">
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">{getBehaviorIssueLabel(reviewModal.issueType)}</p>
                  <p className="text-sm text-rose-800 dark:text-rose-300 leading-relaxed italic">"{reviewModal.description}"</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-neutral-300">Take Disciplinary Action</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { val: 'none', label: 'No Action (Dismiss)', color: 'border-slate-200 dark:border-neutral-700' },
                      { val: 'warning', label: 'Issue Warning (+1 Warning)', color: 'border-amber-200 dark:border-amber-800' },
                      { val: 'temporary_suspension', label: 'Suspend Account (7 Days)', color: 'border-orange-200 dark:border-orange-800' },
                      { val: 'permanent_ban', label: 'Permanent Ban', color: 'border-rose-300 dark:border-rose-800' },
                    ].map((opt) => (
                      <label key={opt.val} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-neutral-800 ${reviewAction === opt.val ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' : opt.color}`}>
                        <input
                          type="radio"
                          name="reviewAction"
                          value={opt.val}
                          checked={reviewAction === opt.val}
                          onChange={(e) => setReviewAction(e.target.value)}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-neutral-200">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-neutral-300 mb-2">Resolution Notes (Customer visible)</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter notes about the decision..."
                    className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setReviewModal(null)}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-neutral-600 rounded-xl text-slate-600 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all font-display"
                >
                  Close
                </button>
                <PrimaryButton
                  onClick={handleReviewReport}
                  disabled={reviewing}
                  className="flex-1"
                >
                  {reviewing ? 'Processing...' : 'Submit Decision'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
