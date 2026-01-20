import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const CompletedJobs = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('api/provider/bookings'));
      const allBookings = response.data.bookings || [];
      // Filter only completed bookings
      setBookings(allBookings.filter((booking) => booking.status === 'completed'));
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 block transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">Completed Jobs</h1>
          <p className="mt-2 text-gray-600 dark:text-neutral-400">View your completed service bookings</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-neutral-400">Loading completed jobs...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-900/50 p-12 text-center border border-gray-200 dark:border-neutral-700 transition-colors">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600 dark:text-neutral-300 text-lg mb-2">No completed jobs yet.</p>
            <p className="text-gray-500 dark:text-neutral-400 text-sm">Completed bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-900/50 hover:shadow-lg dark:hover:shadow-neutral-900 transition-shadow p-6 border border-gray-200 dark:border-neutral-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                        Completed
                      </span>
                      {booking.completedAt && (
                        <span className="text-sm text-gray-500 dark:text-neutral-400">
                          Completed on {formatDateTime(booking.completedAt)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
                      {booking.service?.title || 'Service'}
                    </h3>
                    {booking.customer && (
                      <p className="text-gray-600 dark:text-neutral-300 mb-1">
                        Customer: <span className="font-semibold">{booking.customer.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{booking.totalAmount}</p>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">Total Amount</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-neutral-300 mb-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div>
                    <p className="mb-1">
                      <span className="font-semibold">Service Date:</span> {formatDate(booking.bookingDate)}
                    </p>
                    <p className="mb-1">
                      <span className="font-semibold">Service Time:</span> {booking.bookingTime}
                    </p>
                    {booking.service && (
                      <p>
                        <span className="font-semibold">Duration:</span> {booking.service.duration} minutes
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1">
                      <span className="font-semibold">Customer Phone:</span> {booking.phone}
                    </p>
                    {booking.customer && (
                      <p className="mb-1">
                        <span className="font-semibold">Customer Email:</span> {booking.customer.email}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Payment Status:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.paymentStatus === 'paid'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : booking.paymentStatus === 'refunded'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}
                      >
                        {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                {booking.address && booking.address.street && (
                  <div className="mb-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <p className="text-sm text-gray-600 dark:text-neutral-300 mb-1">
                      <span className="font-semibold">Service Address:</span>
                    </p>
                    <p className="text-sm text-gray-700 dark:text-neutral-300">
                      {[
                        booking.address.street,
                        booking.address.city,
                        booking.address.state,
                        booking.address.zipCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}

                {booking.notes && (
                  <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <p className="text-sm text-gray-700 dark:text-neutral-300">
                      <span className="font-semibold">Customer Notes:</span> {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-900/50 p-6 border border-gray-200 dark:border-neutral-700 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{bookings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Average per Job</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{(bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) / bookings.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedJobs;
