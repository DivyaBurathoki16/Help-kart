import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';
import { getApiUrl } from '../../config/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: null,
  });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      setFetching(true);
      const response = await axios.get(getApiUrl('api/auth/me'));
      const userData = response.data.user;
      setFormData({
        name: userData.name || '',
        phone: userData.phone?.startsWith('+') ? userData.phone.substring(1) : (userData.phone || ''),
        location: userData.location || null,
      });
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    setPhoneError('');
  };

  const handleLocationChange = (location) => {
    setFormData({
      ...formData,
      location: location,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    // Validate phone number
    if (!formData.phone) {
      setPhoneError('Phone number is required');
      return;
    }

    if (formData.phone.length < 10) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      await axios.patch(getApiUrl('api/auth/profile'), {
        name: formData.name,
        phone: '+' + formData.phone,
        location: formData.location,
      });
      alert('Profile updated successfully!');
      // Refresh user data in context
      if (fetchUser) {
        await fetchUser();
      }
      navigate('/customer/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-8 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-neutral-100">My Profile</h1>
          <p className="mt-2 text-slate-600 dark:text-neutral-300">Manage your profile information and location</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-950/50 p-6 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Phone Number *
              </label>
              <PhoneInput
                country={'us'}
                value={formData.phone}
                onChange={handlePhoneChange}
                enableSearch={true}
                searchPlaceholder="Search country"
                containerClass="phone-input-container"
                inputClass={`phone-input ${phoneError ? 'phone-input-error' : ''}`}
                buttonClass="phone-dropdown-button"
                dropdownClass="phone-dropdown"
                searchClass="phone-search"
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: false
                }}
              />
              {phoneError && (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{phoneError}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Your Location
              </label>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
                Set your location to find services near you. This helps us show you the closest service providers.
              </p>
              <LocationPicker
                onLocationChange={handleLocationChange}
                initialLocation={formData.location}
                readOnly={false}
              />
            </div>

            {/* Info Box */}
            {formData.location && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Location saved!</strong> Services will be sorted by distance from your location when you browse.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/customer/dashboard')}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
