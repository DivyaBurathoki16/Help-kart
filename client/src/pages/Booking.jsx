import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LocationPicker from '../components/LocationPicker';
import { getApiUrl } from '../config/api';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providerSchedule, setProviderSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookingDate: '',
    bookingTime: '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: '',
  });

  // Time picker state
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Sync derived bookingTime
  useEffect(() => {
    const time12h = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    setFormData(prev => ({ ...prev, bookingTime: convertTo24h(time12h) }));
  }, [selectedHour, selectedMinute, selectedPeriod]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/book/${id}` } });
      return;
    }

    if (user.role !== 'customer') {
      navigate('/');
      return;
    }

    fetchService();
  }, [id, user, navigate]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl(`api/services/${id}`));
      setService(response.data.service);

      // Fetch provider's schedule
      if (response.data.service?.provider?._id) {
        fetchProviderSchedule(response.data.service.provider._id);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderSchedule = async (providerId) => {
    try {
      setScheduleLoading(true);
      const response = await axios.get(getApiUrl(`api/bookings/provider/${providerId}/schedule`));
      setProviderSchedule(response.data.schedule || []);
    } catch (error) {
      console.error('Error fetching provider schedule:', error);
      setProviderSchedule([]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const time12h = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    if (!isTimeWithinWorkingHours(time12h)) {
      alert('Selected time is outside working hours (9:00 AM – 10:00 PM).');
      return;
    }
    if (isTimeSlotPassed(time12h)) {
      alert('The selected time has already passed. Please choose a future time.');
      return;
    }
    if (isTimeSlotBooked(time12h)) {
      alert('This time slot is already booked. Please choose another one.');
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        service: id,
        bookingDate: formData.bookingDate,
        bookingTime: formData.bookingTime,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        notes: formData.notes,
      };

      await axios.post(getApiUrl('api/bookings'), bookingData);
      navigate('/customer/bookings', { state: { success: true } });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get date one month from now in YYYY-MM-DD format
  const getOneMonthFromNowDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  // Convert 12h time to 24h for backend
  const convertTo24h = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Check if a time slot has already passed (only relevant if booking for today)
  const isTimeSlotPassed = (slot12h) => {
    if (formData.bookingDate !== getTodayDate()) return false;

    const now = new Date();
    const [time, modifier] = slot12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

    const slotDate = new Date();
    slotDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    return slotDate < now;
  };

  // Check if a time slot is already booked for the selected local date
  const isTimeSlotBooked = (slot12h) => {
    if (!formData.bookingDate) return false;

    const slot24h = convertTo24h(slot12h);

    return providerSchedule.some(item => {
      // Compare only YYYY-MM-DD
      const bookedDate = item.date; // already YYYY-MM-DD from backend
      const selectedDate = formData.bookingDate;

      return bookedDate === selectedDate && item.time === slot24h;
    });
  };

  // Check if a time slot is within working hours (9 AM - 10 PM)
  const isTimeWithinWorkingHours = (slot12h) => {
    const [time, modifier] = slot12h.split(' ');
    let [hours] = time.split(':');
    let h24 = parseInt(hours, 10);

    if (h24 === 12) h24 = 0;
    if (modifier === 'PM') h24 += 12;

    // Range: 9 (9 AM) to 22 (10 PM)
    return h24 >= 9 && h24 <= 22;
  };

  // Convert 24h to 12h for initial form data if needed (though we start empty)
  const convertTo12h = (time24h) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Format date for display
  const formatScheduleDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group schedule by date
  const groupedSchedule = providerSchedule.reduce((acc, item) => {
    const dateKey = item.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Service not found</h2>
          <button
            onClick={() => navigate('/services')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Go back to services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-8 font-medium flex items-center gap-2 group transition-all duration-300"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Booking Summary</h2>
          <div className="border-b border-slate-200 dark:border-neutral-700 pb-4 mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-neutral-100 mb-2">{service.title}</h3>
            {service.provider && (
              <p className="text-slate-600 dark:text-neutral-400">Provider: <span className="font-semibold">{service.provider.businessName}</span></p>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-600 dark:text-neutral-400">Duration: <span className="font-semibold text-slate-900 dark:text-neutral-100">{service.duration} minutes</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-neutral-400">Total Amount</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">₹{service.price}</p>
            </div>
          </div>
        </Card>

        {/* Service Location */}
        {service.location && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Service Location</h2>
            <LocationPicker
              initialLocation={service.location}
              readOnly={true}
            />
          </Card>
        )}

        {/* Provider's Schedule */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-neutral-100 mb-1">📅 Provider's Schedule</h2>
              <p className="text-sm text-slate-600 dark:text-neutral-400">Current bookings for the next 30 days</p>
            </div>
            {scheduleLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            )}
          </div>

          {!scheduleLoading && providerSchedule.length === 0 ? (
            <div className="text-center py-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <svg className="w-12 h-12 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-800 dark:text-emerald-300 font-semibold mb-1">No upcoming bookings</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Provider has full availability</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedSchedule).map(([date, bookings]) => (
                <div key={date} className="border border-slate-200 dark:border-neutral-700 rounded-xl p-4 bg-slate-50 dark:bg-neutral-700/50 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-300 dark:border-neutral-600">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold text-slate-900 dark:text-neutral-100">{formatScheduleDate(date)}</span>
                  </div>
                  <div className="space-y-2">
                    {bookings.map((booking, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span className="font-semibold text-slate-900 dark:text-neutral-100">{booking.time}</span>
                          <span className="text-sm text-slate-600 dark:text-neutral-400">({booking.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600 dark:text-neutral-400">{booking.serviceName}</span>
                          <span className="badge badge-error text-xs">Booked</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-semibold">💡 Tip:</span> Choose a date and time that doesn't conflict with the booked slots shown above.
            </p>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-6">Booking Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bookingDate" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  Booking Date *
                </label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  required
                  min={getTodayDate()}
                  max={getOneMonthFromNowDate()}
                  value={formData.bookingDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
                  Select Time *
                </label>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {/* Hour Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                        className="h-10 w-20 appearance-none bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer text-slate-900 dark:text-neutral-100"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>

                    <span className="text-slate-400 dark:text-neutral-500 font-medium">:</span>

                    {/* Minute Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedMinute}
                        onChange={(e) => setSelectedMinute(e.target.value)}
                        className="h-10 w-20 appearance-none bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer text-slate-900 dark:text-neutral-100"
                      >
                        {['00', '15', '30', '45'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>

                    {/* AM/PM Toggle */}
                    <div className="flex rounded-md border border-slate-300 dark:border-neutral-700 overflow-hidden ml-2 shadow-sm">
                      {["AM", "PM"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`h-10 px-4 text-xs font-bold transition-all ${selectedPeriod === p
                            ? "bg-slate-900 dark:bg-blue-600 text-white"
                            : "bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-700"
                            }`}
                          onClick={() => setSelectedPeriod(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Hint & Validation */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                      Available between 9:00 AM – 10:00 PM
                    </p>

                    {!isTimeWithinWorkingHours(`${selectedHour}:${selectedMinute} ${selectedPeriod}`) ? (
                      <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1.5 leading-tight">
                        <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                        Outside working hours (9 AM – 10 PM).
                      </p>
                    ) : isTimeSlotBooked(`${selectedHour}:${selectedMinute} ${selectedPeriod}`) ? (
                      <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1.5 leading-tight">
                        <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                        Selected slot is already booked. Please choose another time.
                      </p>
                    ) : isTimeSlotPassed(`${selectedHour}:${selectedMinute} ${selectedPeriod}`) ? (
                      <p className="text-[11px] text-amber-500 font-bold flex items-center gap-1.5 leading-tight">
                        <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                        This time has already passed for today.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 dark:bg-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Service Address (Optional)</label>
              <div className="space-y-4">
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                  placeholder="Street Address"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                    placeholder="State"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                    placeholder="ZIP Code"
                  />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 dark:bg-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 backdrop-blur-sm text-slate-900 dark:text-white transition-all duration-300"
                placeholder="Any special requirements or instructions..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all duration-300"
              >
                Cancel
              </button>
              <PrimaryButton
                type="submit"
                disabled={submitting}
                className="flex-1"
                icon="✓"
                iconPosition="right"
              >
                {submitting ? 'Creating Booking...' : 'Confirm Booking'}
              </PrimaryButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
