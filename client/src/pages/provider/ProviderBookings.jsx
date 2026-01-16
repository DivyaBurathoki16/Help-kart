import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PaymentStatusBadge from '../../components/ui/PaymentStatusBadge';
import ServiceStatusBadge from '../../components/ui/ServiceStatusBadge';
import PrimaryButton from '../../components/ui/PrimaryButton';

const ProviderBookings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [conflictModal, setConflictModal] = useState(null); // { bookingId, conflicts }
  const [completeModal, setCompleteModal] = useState(null); // { bookingId }
  const [proofImages, setProofImages] = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/provider/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((booking) => booking.status === statusFilter));
    }
  };

  const handleProofImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length + proofImages.length > 5) {
      alert('You can upload maximum 5 images');
      return;
    }

    setUploadingProof(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post('http://localhost:5000/api/upload/issue-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProofImages([...proofImages, ...response.data.images]);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleRemoveProofImage = (index) => {
    setProofImages(proofImages.filter((_, i) => i !== index));
  };

  const handleMarkCompleted = async () => {
    if (!completeModal) return;

    if (proofImages.length === 0) {
      alert('Please upload at least one proof of work image');
      return;
    }

    try {
      setResolving(true);
      const response = await axios.patch(`http://localhost:5000/api/provider/bookings/${completeModal.bookingId}/complete`, {
        proofOfWork: proofImages
      });

      if (!response.data.success) {
        alert(response.data.message || 'Failed to mark booking as completed');
        return;
      }

      setCompleteModal(null);
      setProofImages([]);
      fetchBookings();

      alert(
        response.data.message ||
        'Service marked as completed successfully.'
      );
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark booking as completed');
    } finally {
      setResolving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/provider/bookings/${id}`, { status });

      // Check if conflicts need resolution
      if (status === 'accepted' && response.data.requiresConflictResolution) {
        // Show conflict resolution modal
        setConflictModal({
          bookingId: response.data.bookingId,
          conflicts: response.data.conflicts,
        });
        return;
      }

      fetchBookings();

      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      } else if (status === 'accepted') {
        alert('Booking accepted successfully!');
      } else if (status === 'rejected') {
        alert('Booking rejected.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const resolveConflicts = async (action, rescheduleMessage = '') => {
    if (!conflictModal) return;

    try {
      setResolving(true);
      const conflictIds = conflictModal.conflicts.map(c => c.id);

      const response = await axios.post(
        `http://localhost:5000/api/provider/bookings/${conflictModal.bookingId}/resolve-conflicts`,
        {
          action,
          conflictIds,
          rescheduleMessage,
        }
      );

      setConflictModal(null);
      fetchBookings();
      alert(response.data.message || 'Conflicts resolved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve conflicts');
    } finally {
      setResolving(false);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 block font-medium flex items-center gap-2 group transition-all duration-300"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">Booking Requests</h1>
          <p className="mt-2 text-slate-600 dark:text-neutral-300 text-lg">Manage your service bookings</p>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-8 p-4 dark:bg-neutral-800 dark:border-neutral-700">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All', count: bookings.length },
              { value: 'pending', label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
              { value: 'accepted', label: 'Accepted', count: bookings.filter((b) => b.status === 'accepted').length },
              { value: 'confirmed', label: 'Confirmed', count: bookings.filter((b) => b.status === 'confirmed').length },
              { value: 'in_progress', label: 'In Progress', count: bookings.filter((b) => b.status === 'in_progress').length },
              { value: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed' || b.status === 'provider_completed').length },
              { value: 'rejected', label: 'Rejected', count: bookings.filter((b) => b.status === 'rejected').length },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${statusFilter === filter.value
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-600 hover:scale-105'
                  }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="p-12 text-center dark:bg-neutral-800 dark:border-neutral-700">
            <p className="text-slate-600 dark:text-neutral-300 text-lg">
              {bookings.length === 0
                ? 'No booking requests yet.'
                : `No ${statusFilter === 'all' ? '' : statusFilter} bookings found.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card
                key={booking._id}
                className="border-l-4 dark:bg-neutral-800 dark:border-neutral-700"
                style={{
                  borderLeftColor:
                    booking.status === 'pending'
                      ? '#f59e0b'
                      : booking.status === 'accepted'
                        ? '#3b82f6'
                        : booking.status === 'confirmed'
                          ? '#3b82f6'
                          : booking.status === 'in_progress'
                            ? '#6366f1'
                            : booking.status === 'provider_completed' || booking.status === 'completed'
                              ? '#10b981'
                              : '#ef4444',
                }}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                              {booking.service?.title || 'Service'}
                            </h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          {booking.customer && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-neutral-300">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="font-semibold text-slate-900 dark:text-neutral-100">{booking.customer.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">${booking.totalAmount}</p>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">Total Amount</p>
                        </div>
                      </div>

                      {/* Payment & Service Status */}
                      <div className="flex flex-wrap items-center gap-3 mb-3 p-3 bg-slate-50 dark:bg-neutral-700/50 rounded-xl border border-slate-200 dark:border-neutral-600">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 dark:text-neutral-300">Payment:</span>
                          <PaymentStatusBadge
                            paymentStatus={booking.paymentStatus}
                            paymentMethod={booking.paymentMethod}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 dark:text-neutral-300">Service:</span>
                          <ServiceStatusBadge serviceStatus={booking.serviceStatus || 'pending'} />
                        </div>
                        {booking.paymentStatus === 'paid' && booking.paidAt && (
                          <div className="text-xs text-slate-500 dark:text-neutral-400 ml-auto">
                            Paid on: {new Date(booking.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Booking status hint for confirmed bookings */}
                      {booking.status === 'confirmed' && (
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
                          <span className="text-[10px]">⏱</span>
                          <span>Confirmed · You can mark this completed after the start time</span>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-4 h-4 text-slate-400 dark:text-neutral-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-slate-600 dark:text-neutral-300">
                              <span className="font-semibold text-slate-900 dark:text-neutral-100">Date:</span> {formatDate(booking.bookingDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-4 h-4 text-slate-400 dark:text-neutral-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-slate-600 dark:text-neutral-300">
                              <span className="font-semibold text-slate-900 dark:text-neutral-100">Time:</span> {booking.bookingTime}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-4 h-4 text-slate-400 dark:text-neutral-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="text-slate-600 dark:text-neutral-300">
                              <span className="font-semibold text-slate-900 dark:text-neutral-100">Phone:</span> {booking.phone}
                            </span>
                          </div>
                          {booking.customer && (
                            <div className="flex items-center gap-2 text-sm">
                              <svg
                                className="w-4 h-4 text-slate-400 dark:text-neutral-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-slate-600 dark:text-neutral-300">{booking.customer.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      {booking.address && booking.address.street && (
                        <div className="mb-4 p-4 bg-slate-50 dark:bg-neutral-700/50 rounded-xl border border-slate-200 dark:border-neutral-600">
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-slate-400 dark:text-neutral-500 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <div className="text-sm text-slate-700 dark:text-neutral-300">
                              <span className="font-semibold text-slate-900 dark:text-neutral-100">Address:</span>{' '}
                              {[
                                booking.address.street,
                                booking.address.city,
                                booking.address.state,
                                booking.address.zipCode,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <div className="text-sm text-slate-700 dark:text-neutral-300">
                              <span className="font-semibold text-blue-700 dark:text-blue-300">Customer Notes:</span>{' '}
                              <span className="text-slate-600 dark:text-neutral-400">{booking.notes}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:ml-6 flex flex-col gap-2 lg:min-w-[150px]">
                      {booking.status === 'pending' && (
                        <>
                          <PrimaryButton
                            onClick={() => updateStatus(booking._id, 'accepted')}
                            variant="success"
                            className="w-full"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            }
                            iconPosition="left"
                          >
                            Accept
                          </PrimaryButton>
                          <PrimaryButton
                            onClick={() => updateStatus(booking._id, 'rejected')}
                            variant="danger"
                            className="w-full"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            }
                            iconPosition="left"
                          >
                            Reject
                          </PrimaryButton>
                        </>
                      )}
                      {/* Provider marks service as completed (dual confirmation flow) */}
                      {booking.status === 'in_progress' && (
                        <PrimaryButton
                          onClick={() => {
                            setCompleteModal({ bookingId: booking._id });
                            setProofImages([]);
                          }}
                          className="w-full"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                          iconPosition="left"
                        >
                          Mark as Completed
                        </PrimaryButton>
                      )}
                      {(booking.status === 'completed' || booking.status === 'provider_completed') && (
                        <div className="px-4 py-2.5 text-center text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl font-semibold border border-emerald-200 dark:border-emerald-800">
                          ✓ Completed
                        </div>
                      )}
                      {(booking.status === 'cancelled_by_customer' || booking.status === 'cancelled') && (
                        <div className="px-4 py-2.5 text-center text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 rounded-xl font-semibold border border-rose-200 dark:border-rose-800">
                          Customer cancelled this booking
                        </div>
                      )}
                      {booking.status === 'rejected' && (
                        <div className="px-4 py-2.5 text-center text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 rounded-xl font-semibold border border-rose-200 dark:border-rose-800">
                          ✗ Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Conflict Resolution Modal */}
      {conflictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Resolve Booking Conflicts</h2>
                <button
                  onClick={() => setConflictModal(null)}
                  className="text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-slate-700 dark:text-neutral-300">
                  This booking conflicts with <strong>{conflictModal.conflicts.length}</strong> other pending request(s) for the same time slot.
                  <br />
                  <span className="text-sm text-slate-600 dark:text-neutral-400 mt-1 block">What would you like to do?</span>
                </p>
              </div>

              {/* Conflicting Bookings List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">Conflicting Bookings:</h3>
                <div className="space-y-2">
                  {conflictModal.conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="p-3 bg-slate-50 dark:bg-neutral-700/50 rounded-lg border border-slate-200 dark:border-neutral-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-neutral-100">{conflict.customerName}</p>
                          <p className="text-sm text-slate-600 dark:text-neutral-300">{conflict.serviceTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">{conflict.bookingTime}</p>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">
                            {new Date(conflict.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryButton
                  onClick={() => resolveConflicts('reject')}
                  variant="danger"
                  disabled={resolving}
                  className="flex-1"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                  iconPosition="left"
                >
                  {resolving ? 'Processing...' : 'Reject Conflicting Bookings'}
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => resolveConflicts('reschedule')}
                  variant="warning"
                  disabled={resolving}
                  className="flex-1"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  iconPosition="left"
                >
                  {resolving ? 'Processing...' : 'Ask Customers to Reschedule'}
                </PrimaryButton>
                <button
                  onClick={() => setConflictModal(null)}
                  disabled={resolving}
                  className="px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Complete Service Modal with Proof Upload */}
      {completeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Complete Service</h2>
                <button
                  onClick={() => {
                    setCompleteModal(null);
                    setProofImages([]);
                  }}
                  className="text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Please upload photos of your completed work as proof. This helps resolve potential disputes and builds trust with customers.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                      Proof of Work Photos <span className="text-rose-500">*</span>
                    </label>

                    {/* Image Grid */}
                    {proofImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                        {proofImages.map((img, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img
                              src={`http://localhost:5000${img}`}
                              alt={`Proof ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-neutral-600"
                            />
                            <button
                              onClick={() => handleRemoveProofImage(index)}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    {proofImages.length < 5 && (
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingProof ? 'bg-slate-50 dark:bg-neutral-700 border-slate-300 dark:border-neutral-600' : 'border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingProof ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          ) : (
                            <>
                              <svg className="w-8 h-8 mb-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-slate-500 dark:text-neutral-300 font-medium">Click to upload photos</p>
                              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">PNG, JPG up to 5MB (Max 5)</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleProofImageUpload}
                          disabled={uploadingProof}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCompleteModal(null);
                    setProofImages([]);
                  }}
                  disabled={resolving}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleMarkCompleted}
                  disabled={resolving || proofImages.length === 0}
                  className="flex-1"
                  icon={
                    resolving ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )
                  }
                  iconPosition="left"
                >
                  {resolving ? 'Completing...' : 'Submit Proof & Complete'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;
