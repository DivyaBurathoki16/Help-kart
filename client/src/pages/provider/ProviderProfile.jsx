import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
<<<<<<< HEAD
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [provider, setProvider] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    yearsOfExperience: 0,
    licenseNumber: '',
  });
<<<<<<< HEAD
  const [phoneError, setPhoneError] = useState('');
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      setFetching(true);
      const response = await axios.get(getApiUrl('api/provider/profile'));
      const providerData = response.data.provider;
      setProvider(providerData);
      setFormData({
        businessName: providerData.businessName || '',
        description: providerData.description || '',
<<<<<<< HEAD
        phone: providerData.phone?.startsWith('+') ? providerData.phone.substring(1) : (providerData.phone || ''),
=======
        phone: providerData.phone || '',
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
        address: {
          street: providerData.address?.street || '',
          city: providerData.address?.city || '',
          state: providerData.address?.state || '',
          zipCode: providerData.address?.zipCode || '',
          country: providerData.address?.country || '',
        },
        yearsOfExperience: providerData.yearsOfExperience || 0,
        licenseNumber: providerData.licenseNumber || '',
      });
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      if (error.response?.status === 404) {
        // Provider profile doesn't exist yet, allow creation
        setProvider(null);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

<<<<<<< HEAD
  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    setPhoneError('');
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
      const dataToSubmit = {
        ...formData,
        phone: '+' + formData.phone
      };

      if (provider) {
        // Update existing profile
        await axios.patch(getApiUrl('api/provider/profile'), dataToSubmit);
        alert('Profile updated successfully!');
      } else {
        // Create new profile
        await axios.post(getApiUrl('api/provider/profile'), dataToSubmit);
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (provider) {
        // Update existing profile
        await axios.patch(getApiUrl('api/provider/profile'), formData);
        alert('Profile updated successfully!');
      } else {
        // Create new profile
        await axios.post(getApiUrl('api/provider/profile'), formData);
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
        alert('Profile created successfully!');
      }
      fetchProviderProfile();
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
            onClick={() => navigate('/provider/dashboard')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-neutral-100">My Profile</h1>
          <p className="mt-2 text-slate-600 dark:text-neutral-300">Manage your provider profile information</p>
        </div>

        {/* Profile Stats */}
        {provider && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-950/50 p-6 mb-6 transition-colors duration-300">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-neutral-300">Rating</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                  {provider.rating?.toFixed(1) || '0.0'} ⭐
                </p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">{provider.totalReviews || 0} reviews</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-neutral-300">Experience</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                  {provider.yearsOfExperience || 0} {provider.yearsOfExperience === 1 ? 'year' : 'years'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-neutral-300">Status</p>
                <p className="text-2xl font-bold">
                  <span
<<<<<<< HEAD
                    className={`${provider.isApproved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}
=======
                    className={`${
                      provider.isApproved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
                  >
                    {provider.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-950/50 p-6 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., ABC Painting Services"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Tell customers about your business..."
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                Phone Number *
              </label>
<<<<<<< HEAD
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
=======
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 (555) 123-4567"
              />
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Business Address</label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Street Address"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="State"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="ZIP Code"
                  />
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Years of Experience & License */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
                  License Number (Optional)
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="License #"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/provider/dashboard')}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : provider ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
