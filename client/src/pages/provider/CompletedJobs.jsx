import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.get('http://localhost:5000/api/provider/bookings');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-4 block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Completed Jobs</h1>
          <p className="mt-2 text-gray-600">View your completed service bookings</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading completed jobs...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600 text-lg mb-2">No completed jobs yet.</p>
            <p className="text-gray-500 text-sm">Completed bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Completed
                      </span>
                      {booking.completedAt && (
                        <span className="text-sm text-gray-500">
                          Completed on {formatDateTime(booking.completedAt)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {booking.service?.title || 'Service'}
                    </h3>
                    {booking.customer && (
                      <p className="text-gray-600 mb-1">
                        Customer: <span className="font-semibold">{booking.customer.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${booking.totalAmount}</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4 pt-4 border-t border-gray-200">
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
                            ? 'bg-green-100 text-green-800'
                            : booking.paymentStatus === 'refunded'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                {booking.address && booking.address.street && (
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Service Address:</span>
                    </p>
                    <p className="text-sm text-gray-700">
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
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
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
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average per Job</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) / bookings.length).toFixed(2)}
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
