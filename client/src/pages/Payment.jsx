import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/bookings/my`);
      const bookings = response.data.bookings || [];
      const currentBooking = bookings.find(b => b._id === bookingId);
      
      if (!currentBooking) {
        alert('Booking not found');
        navigate('/customer/bookings');
        return;
      }

      // Verify booking is in correct state for payment
      if (currentBooking.status !== 'accepted') {
        alert('This booking is not eligible for payment');
        navigate('/customer/bookings');
        return;
      }

      if (currentBooking.paymentStatus === 'paid') {
        alert('This booking is already paid');
        navigate('/customer/bookings');
        return;
      }

      setBooking(currentBooking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to load booking details');
      navigate('/customer/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!window.confirm(`Confirm payment of $${booking.totalAmount}?`)) {
      return;
    }

    try {
      setProcessing(true);
      
      // TODO: In production, this would be called by payment gateway callback/webhook
      // For testing, we're simulating a successful payment
      const response = await axios.post('http://localhost:5000/api/payments/verify', {
        bookingId: booking._id,
        paymentId: `test_payment_${Date.now()}`, // Fake payment ID for testing
        paymentStatus: 'paid',
      });

      if (response.data.success) {
        alert('Payment successful! ✅');
        navigate('/customer/bookings');
      } else {
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Payment</h1>
            <p className="text-slate-600">Review your booking and confirm payment</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Service:</span>
                <span className="font-semibold text-slate-900">{booking.service?.title || 'Service'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Provider:</span>
                <span className="font-semibold text-slate-900">{booking.provider?.businessName || 'Provider'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="font-semibold text-slate-900">{formatDate(booking.bookingDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time:</span>
                <span className="font-semibold text-slate-900">{booking.bookingTime}</span>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Total Amount</p>
              <p className="text-4xl font-extrabold text-blue-600">${booking.totalAmount}</p>
            </div>
          </div>

          {/* Payment Method (Placeholder for future gateway integration) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method
            </label>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
              <p className="text-slate-600 text-sm">
                🧪 <strong>Test Mode:</strong> This is a simulated payment page for testing.
                <br />
                In production, this would integrate with Razorpay/Stripe.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/customer/bookings')}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <PrimaryButton
              onClick={handleConfirmPayment}
              disabled={processing}
              className="flex-1"
              icon={
                processing ? (
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
              {processing ? 'Processing...' : 'Confirm Payment'}
            </PrimaryButton>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              🔒 Your payment information is secure. This is a test payment page.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
