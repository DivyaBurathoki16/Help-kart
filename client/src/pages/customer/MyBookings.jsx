import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PaymentStatusBadge from '../../components/ui/PaymentStatusBadge';
import ServiceStatusBadge from '../../components/ui/ServiceStatusBadge';
import PrimaryButton from '../../components/ui/PrimaryButton';
import BehaviorReportModal from '../../components/modals/BehaviorReportModal';
import ReviewModal from '../../components/modals/ReviewModal';
import { getApiUrl } from '../../config/api';
import API_URL from '../../config/api';

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(null); // { bookingId, booking }
  const [rescheduleData, setRescheduleData] = useState({ bookingDate: '', bookingTime: '' });
  const [rescheduling, setRescheduling] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null); // { bookingId, booking }
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [issueModal, setIssueModal] = useState(null); // { bookingId, booking }
  const [issueData, setIssueData] = useState({ issueType: '', issueDescription: '', issueImages: [] });
  const [reportingIssue, setReportingIssue] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [behaviorReportModal, setBehaviorReportModal] = useState(null); // { bookingId, booking }
  const [reviewModal, setReviewModal] = useState(null); // { booking }

  useEffect(() => {
    fetchBookings();

    // Show success message if redirected from booking creation
    if (location.state?.success) {
      alert('Booking created successfully!');
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('api/bookings/my'));
      const bookings = response.data.bookings || [];
      setBookings(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePaymentClick = (booking) => {
    setPaymentModal({ bookingId: booking._id, booking });
    setSelectedPaymentMethod('');
  };

  const handlePayment = async () => {
    if (!paymentModal || !selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Show confirmation for online payments
    if (selectedPaymentMethod !== 'COD') {
      const confirmMessage = `Confirm payment of ₹${paymentModal.booking?.totalAmount || 0} via ${selectedPaymentMethod === 'UPI' ? 'UPI' : 'Card'}?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setProcessingPayment(true);
      const response = await axios.put(getApiUrl(`api/bookings/${paymentModal.bookingId}/pay`), {
        paymentMethod: selectedPaymentMethod,
      });

      if (response.data.success) {
        // Show success message
        const successMessage = selectedPaymentMethod === 'COD'
          ? '✅ Booking confirmed! Payment will be collected after service completion.'
          : '✅ Payment successful! Your booking is confirmed.';
        alert(successMessage);
        setPaymentModal(null);
        setSelectedPaymentMethod('');
        fetchBookings(); // Refresh bookings list
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      alert(`❌ ${errorMessage}`);
      console.error('Payment error:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    const labels = {
      unpaid: 'Unpaid',
      pending: 'Payment in Progress',
      paid: 'Paid',
      failed: 'Payment Failed',
    };
    return labels[paymentStatus] || paymentStatus;
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      unpaid: 'text-amber-600',
      pending: 'text-blue-600',
      paid: 'text-emerald-600',
      failed: 'text-rose-600',
    };
    return colors[paymentStatus] || 'text-slate-500';
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };



  const handleReschedule = async () => {
    if (!rescheduleModal) return;

    try {
      setRescheduling(true);
      const response = await axios.patch(
        getApiUrl(`api/bookings/${rescheduleModal.bookingId}/reschedule`),
        rescheduleData
      );

      setRescheduleModal(null);
      setRescheduleData({ bookingDate: '', bookingTime: '' });
      fetchBookings();
      alert(response.data.message || 'Booking rescheduled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.patch(getApiUrl(`api/bookings/${bookingId}/cancel`), {
        reason: 'Cancelled by customer',
      });
      await fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  // Check if issue reporting window is still open (7 days after completion)
  const isIssueWindowOpen = useCallback((booking) => {
    if (booking.status === 'provider_completed') return true; // Always open if waiting for customer confirmation

    if (booking.status !== 'completed' || !booking.completedAt) {
      return false;
    }
    if (booking.issueReportedAt || booking.status === 'issue_reported') {
      return false; // Issue already reported
    }
    const now = new Date();
    const completedAt = new Date(booking.completedAt);
    const issueWindowExpiresAt = booking.issueWindowExpiresAt
      ? new Date(booking.issueWindowExpiresAt)
      : new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return now <= issueWindowExpiresAt;
  }, []);

  const handleReportIssueClick = (booking) => {
    setIssueModal({ bookingId: booking._id, booking });
    setIssueData({ issueType: '', issueDescription: '', issueImages: [] });
  };

  const handleGiveReviewClick = (booking) => {
    setReviewModal({ booking });
  };

  const handleIssueImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length + issueData.issueImages.length > 5) {
      alert('You can upload maximum 5 images');
      return;
    }

    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(getApiUrl('api/upload/issue-images'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIssueData({
        ...issueData,
        issueImages: [...issueData.issueImages, ...response.data.images],
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveIssueImage = (index) => {
    setIssueData({
      ...issueData,
      issueImages: issueData.issueImages.filter((_, i) => i !== index),
    });
  };

  const handleReportIssue = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!issueModal) return;

    if (!issueData.issueType) {
      alert('Please select an issue type');
      return;
    }

    if (!issueData.issueDescription || issueData.issueDescription.trim().length < 10) {
      alert('Please provide a detailed description (minimum 10 characters)');
      return;
    }

    try {
      setReportingIssue(true);
      const response = await axios.post(
        getApiUrl(`api/bookings/${issueModal.bookingId}/report-issue`),
        {
          issueType: issueData.issueType,
          issueDescription: issueData.issueDescription,
          issueImages: issueData.issueImages,
        }
      );

      setIssueModal(null);
      setIssueData({ issueType: '', issueDescription: '', issueImages: [] });
      fetchBookings();
      alert(response.data.message || 'Issue reported successfully. Our team will review and respond shortly.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setReportingIssue(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 block font-medium flex items-center gap-2 group transition-all duration-300"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">My Bookings</h1>
            <p className="mt-2 text-slate-600 dark:text-neutral-300 text-lg">View and manage your service bookings</p>
          </div>
          <PrimaryButton onClick={() => navigate('/services')} icon="+" iconPosition="left">
            Book New Service
          </PrimaryButton>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center dark:bg-neutral-800 dark:border-neutral-700">
            <p className="text-slate-600 dark:text-neutral-300 text-lg mb-6">You haven't made any bookings yet.</p>
            <PrimaryButton onClick={() => navigate('/services')}>
              Browse Services
            </PrimaryButton>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <Card key={booking._id} className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
                {/* TOP SECTION - Service Details */}
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-neutral-700">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-2">
                        {booking.service?.title || 'Service'}
                      </h3>
                      {booking.provider && (
                        <p className="text-sm text-slate-600 dark:text-neutral-300 mb-3">
                          Provider: <span className="font-semibold text-slate-900 dark:text-neutral-100">{booking.provider.businessName}</span>
                        </p>
                      )}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Date, Time, Phone, Address Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">Date:</span>
                      <p className="text-slate-600 dark:text-neutral-300">{formatDate(booking.bookingDate)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">Time:</span>
                      <p className="text-slate-600 dark:text-neutral-300">{booking.bookingTime}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">Phone:</span>
                      <p className="text-slate-600 dark:text-neutral-300">{booking.phone}</p>
                    </div>
                    {booking.address && booking.address.street && (
                      <div className="col-span-2">
                        <span className="font-semibold text-slate-900 dark:text-neutral-100">Address:</span>
                        <p className="text-slate-600 dark:text-neutral-300">
                          {[booking.address.street, booking.address.city, booking.address.state]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-neutral-700/50 rounded-lg border border-slate-200 dark:border-neutral-600">
                      <p className="text-sm">
                        <span className="font-semibold text-slate-900 dark:text-neutral-100">Notes:</span>
                        <span className="text-slate-600 dark:text-neutral-300 ml-2">{booking.notes}</span>
                      </p>
                    </div>
                  )}

                  {/* Reschedule Alert */}
                  {booking.status === 'reschedule_requested' && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                            Reschedule Requested
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                            {booking.rescheduleMessage || 'The provider has requested you to choose another time slot.'}
                          </p>
                          <PrimaryButton
                            onClick={() => {
                              setRescheduleModal({
                                bookingId: booking._id,
                                booking,
                              });
                              setRescheduleData({
                                bookingDate: new Date(booking.bookingDate).toISOString().split('T')[0],
                                bookingTime: booking.bookingTime,
                              });
                            }}
                            variant="warning"
                            className="w-full sm:w-auto"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            }
                            iconPosition="left"
                          >
                            Choose New Time
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM SECTION - Price, Payment Status, Actions */}
                <div>
                  {/* Price and Payment/Service Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-extrabold text-blue-600">
                      ₹{booking.totalAmount}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
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
                    </div>
                  </div>

                  {booking.paymentStatus === 'paid' && booking.paidAt && (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mb-3">
                      Paid on: {new Date(booking.paidAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* Booking Cancelled Message */}
                  {(booking.status === 'cancelled' ||
                    booking.status === 'cancelled_by_customer' ||
                    booking.status === 'cancelled_by_provider') && (
                      <div className="mb-4 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 p-3 rounded-lg border border-rose-200 dark:border-rose-800 font-medium">
                        Booking cancelled
                      </div>
                    )}

                  {/* Payment Actions for Accepted Bookings */}
                  {booking.status === 'accepted' &&
                    booking.status !== 'cancelled' &&
                    booking.status !== 'cancelled_by_customer' &&
                    booking.status !== 'cancelled_by_provider' && (
                      <div className="mb-4">
                        {(booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'pending' || !booking.paymentStatus) && (
                          <div className="mb-3">
                            <div className="text-xs text-slate-600 dark:text-neutral-300 mb-3 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                              ✅ Booking confirmed by provider
                              <br />
                              <span className="text-slate-500 dark:text-neutral-400">Please complete payment to secure your booking</span>
                            </div>
                            <PrimaryButton
                              onClick={() => handlePaymentClick(booking)}
                              className="w-full"
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              }
                              iconPosition="left"
                            >
                              Proceed to Payment
                            </PrimaryButton>
                          </div>
                        )}

                        {booking.paymentStatus === 'paid' && (
                          <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 mb-3">
                            ✓ Payment Successful
                          </div>
                        )}
                      </div>
                    )}

                  {/* Payment Success for Confirmed Bookings */}
                  {booking.status === 'confirmed' &&
                    booking.paymentStatus === 'paid' &&
                    booking.status !== 'cancelled' &&
                    booking.status !== 'cancelled_by_customer' &&
                    booking.status !== 'cancelled_by_provider' && (
                      <div className="mb-4">
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          ✓ Payment Successful
                          <span className="block mt-1 font-semibold">Booking Confirmed</span>
                        </div>
                      </div>
                    )}



                  {/* Report Issue Button */}
                  {(booking.status === 'completed' || booking.status === 'provider_completed') &&
                    booking.status !== 'cancelled' &&
                    booking.status !== 'cancelled_by_customer' &&
                    booking.status !== 'cancelled_by_provider' &&
                    (booking.status === 'provider_completed' || isIssueWindowOpen(booking)) && (
                      <div className="mb-4">
                        <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
                          🔧 Found an issue with the service? You can report it within 48 hours of completion.
                        </div>
                        <PrimaryButton
                          onClick={() => handleReportIssueClick(booking)}
                          variant="outline"
                          className="w-full"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          }
                          iconPosition="left"
                        >
                          Report an Issue
                        </PrimaryButton>
                      </div>
                    )}

                  {/* Issue Reported Status */}
                  {booking.status === 'issue_reported' && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Issue Reported</p>
                          <p className="text-xs text-amber-800 dark:text-amber-300">Your issue has been reported. Our team will review and respond shortly.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Availability Message */}
                  {booking.status !== 'accepted' &&
                    booking.status !== 'confirmed' &&
                    booking.status !== 'completed' &&
                    booking.status !== 'cancelled' &&
                    booking.status !== 'cancelled_by_customer' &&
                    booking.status !== 'cancelled_by_provider' && (
                      <p className="text-xs text-slate-400 dark:text-neutral-500 mb-4">
                        Payment will be available after provider accepts
                      </p>
                    )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Cancel Booking Button */}
                    {['pending', 'accepted', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full bg-rose-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* View Service Link */}
                    <button
                      onClick={() => navigate(`/services/${booking.service?._id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold flex items-center justify-center gap-1 group transition-colors"
                    >
                      View Service <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    {/* Report Provider Behavior Button */}
                    {['confirmed', 'provider_completed', 'completed'].includes(booking.status) &&
                      !booking.behaviorReported && (
                        <button
                          onClick={() => setBehaviorReportModal({ bookingId: booking._id, booking })}
                          className="w-full mt-2 text-rose-600 hover:text-rose-700 text-sm font-semibold flex items-center justify-center gap-2 border border-rose-200 hover:bg-rose-50 py-2 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Report Provider Behavior
                        </button>
                      )}

                    {/* Give Review Button: only when booking is completed and not yet reviewed */}
                    {booking.status === 'completed' && !booking.reviewed && (
                      <button
                        onClick={() => handleGiveReviewClick(booking)}
                        className="w-full mt-2 bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                      >
                        Give Review
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Behavior Report Modal */}
      {behaviorReportModal && (
        <BehaviorReportModal
          booking={behaviorReportModal.booking}
          onClose={() => setBehaviorReportModal(null)}
          onSuccess={() => {
            setBehaviorReportModal(null);
            fetchBookings();
            alert('✅ Behavior report submitted successfully. Our team will review this discreetly.');
          }}
        />
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          booking={reviewModal.booking}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            setReviewModal(null);
            fetchBookings();
          }}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Reschedule Booking</h2>
                <button
                  onClick={() => {
                    setRescheduleModal(null);
                    setRescheduleData({ bookingDate: '', bookingTime: '' });
                  }}
                  className="text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 dark:text-neutral-300 mb-4">
                  Please choose a new date and time for your booking:
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="rescheduleDate" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                      New Date *
                    </label>
                    <input
                      type="date"
                      id="rescheduleDate"
                      required
                      min={getTodayDate()}
                      value={rescheduleData.bookingDate}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, bookingDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="rescheduleTime" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                      New Time *
                    </label>
                    <input
                      type="time"
                      id="rescheduleTime"
                      required
                      value={rescheduleData.bookingTime}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, bookingTime: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRescheduleModal(null);
                    setRescheduleData({ bookingDate: '', bookingTime: '' });
                  }}
                  disabled={rescheduling}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleReschedule}
                  disabled={rescheduling || !rescheduleData.bookingDate || !rescheduleData.bookingTime}
                  className="flex-1"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  iconPosition="left"
                >
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-lg w-full my-8 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Complete Payment</h2>
                  <p className="text-sm text-slate-600 dark:text-neutral-300 mt-1">Select your preferred payment method</p>
                </div>
                <button
                  onClick={() => {
                    setPaymentModal(null);
                    setSelectedPaymentMethod('');
                  }}
                  className="text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
                  disabled={processingPayment}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Booking Summary */}
              {paymentModal.booking && (
                <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-neutral-600">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-neutral-300">Service:</span>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">{paymentModal.booking.service?.title || 'Service'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-neutral-300">Provider:</span>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">{paymentModal.booking.provider?.businessName || 'Provider'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-neutral-300">Date:</span>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">{formatDate(paymentModal.booking.bookingDate)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-neutral-600">
                      <span className="text-slate-600 dark:text-neutral-300">Total Amount:</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">₹{paymentModal.booking.totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="mb-6">
                <p className="text-slate-700 dark:text-neutral-300 mb-4 font-medium">
                  Select your preferred payment method:
                </p>
                <div className="space-y-3">
                  {/* COD Option */}
                  <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedPaymentMethod === 'COD'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-slate-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-neutral-700'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={selectedPaymentMethod === 'COD'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={processingPayment}
                    />
                    <div className="flex-1 flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-neutral-100 mb-1">Cash on Delivery (COD)</div>
                        <div className="text-sm text-slate-600 dark:text-neutral-300">Pay after service completion at your location</div>
                      </div>
                    </div>
                  </label>

                  {/* UPI Option */}
                  <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedPaymentMethod === 'UPI'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-slate-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-neutral-700'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={selectedPaymentMethod === 'UPI'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={processingPayment}
                    />
                    <div className="flex-1 flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-neutral-100 mb-1">UPI Payment</div>
                        <div className="text-sm text-slate-600 dark:text-neutral-300">Pay instantly via UPI (PhonePe, Google Pay, Paytm, etc.)</div>
                      </div>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedPaymentMethod === 'CARD'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-slate-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-neutral-700'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={selectedPaymentMethod === 'CARD'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={processingPayment}
                    />
                    <div className="flex-1 flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-neutral-100 mb-1">Credit / Debit Card</div>
                        <div className="text-sm text-slate-600 dark:text-neutral-300">Pay securely with your credit or debit card</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    <strong>Secure Payment:</strong> Your payment information is encrypted and secure. For COD, payment will be collected after service completion.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaymentModal(null);
                    setSelectedPaymentMethod('');
                  }}
                  disabled={processingPayment}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handlePayment}
                  disabled={processingPayment || !selectedPaymentMethod}
                  className="flex-1"
                  icon={
                    processingPayment ? (
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
                  {processingPayment ? 'Processing Payment...' : selectedPaymentMethod === 'COD' ? 'Confirm Booking' : 'Proceed to Payment'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Issue Report Modal */}
      {issueModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !reportingIssue) {
              setIssueModal(null);
              setIssueData({ issueType: '', issueDescription: '', issueImages: [] });
            }
          }}
        >
          <Card className="max-w-2xl w-full my-8 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Report a Service Issue</h2>
                  <p className="text-sm text-slate-600 dark:text-neutral-300 mt-1">Describe the issue you encountered with the service</p>
                </div>
                <button
                  onClick={() => {
                    setIssueModal(null);
                    setIssueData({ issueType: '', issueDescription: '', issueImages: [] });
                  }}
                  className="text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
                  disabled={reportingIssue}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Issue Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-3">
                  Issue Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'poor_quality', label: 'Poor Quality', icon: '⚠️' },
                    { value: 'incomplete', label: 'Incomplete Work', icon: '❌' },
                    { value: 'damage', label: 'Damage Caused', icon: '💥' },
                    { value: 'other', label: 'Other', icon: '📝' },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${issueData.issueType === type.value
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-slate-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                      <input
                        type="radio"
                        name="issueType"
                        value={type.value}
                        checked={issueData.issueType === type.value}
                        onChange={(e) => setIssueData({ ...issueData, issueType: e.target.value })}
                        className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        disabled={reportingIssue}
                      />
                      <span className="text-lg mr-2">{type.icon}</span>
                      <span className="font-medium text-slate-900 dark:text-neutral-100">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Issue Description */}
              <div className="mb-6">
                <label htmlFor="issueDescription" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="issueDescription"
                  rows="4"
                  value={issueData.issueDescription}
                  onChange={(e) => setIssueData({ ...issueData, issueDescription: e.target.value })}
                  placeholder="Please provide a detailed description of the issue (minimum 10 characters)..."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400 transition-all duration-300 resize-none"
                  disabled={reportingIssue}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                  {issueData.issueDescription.length}/10 minimum characters
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  Upload Photos (Optional, Max 5)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-neutral-600 rounded-xl p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleIssueImageUpload}
                    disabled={reportingIssue || uploadingImages || issueData.issueImages.length >= 5}
                    className="hidden"
                    id="issueImageUpload"
                  />
                  <label
                    htmlFor="issueImageUpload"
                    className={`flex flex-col items-center justify-center cursor-pointer ${reportingIssue || uploadingImages || issueData.issueImages.length >= 5
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:text-blue-600'
                      }`}
                  >
                    {uploadingImages ? (
                      <>
                        <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-slate-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm text-slate-600 dark:text-neutral-300">Click to upload images</span>
                        <span className="text-xs text-slate-400 dark:text-neutral-500 mt-1">PNG, JPG up to 5MB each</span>
                      </> 
                    )}
                  </label>
                </div>

                {/* Preview Uploaded Images */}
                {issueData.issueImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {issueData.issueImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${API_URL}${image}`}
                          alt={`Issue ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-neutral-600"
                        />
                        <button
                          onClick={() => handleRemoveIssueImage(index)}
                          disabled={reportingIssue}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Notice */}
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> Our team will review your issue report. Typically, we'll request the provider to redo the service first. If the redo fails or is not possible, a refund will be processed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIssueModal(null);
                    setIssueData({ issueType: '', issueDescription: '', issueImages: [] });
                  }}
                  disabled={reportingIssue}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleReportIssue(e);
                  }}
                  disabled={reportingIssue || !issueData.issueType || !issueData.issueDescription || issueData.issueDescription.trim().length < 10}
                  className="flex-1"
                  type="button"
                  icon={
                    reportingIssue ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )
                  }
                  iconPosition="left"
                >
                  {reportingIssue ? 'Reporting Issue...' : 'Report Issue'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}


    </div>
  );
};

export default MyBookings;
