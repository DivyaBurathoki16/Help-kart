import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import PhoneInput from '../../components/ui/PhoneInput';

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [provider, setProvider] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    avatar: '',
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
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      setFetching(true);
      const response = await axios.get(getApiUrl('api/provider/profile'));
      const providerData = response.data.provider;
      setProvider(providerData);

      // Also fetch basic user data for avatar
      const userResponse = await axios.get(getApiUrl('api/auth/me'));
      const userData = userResponse.data.user;

      setFormData({
        businessName: providerData.businessName || '',
        description: providerData.description || '',
        phone: providerData.phone?.startsWith('+') ? providerData.phone.substring(1) : (providerData.phone || ''),
        avatar: userData.avatar || '',
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
      setAvatarPreview(userData.avatar || null);
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      if (error.response?.status === 404) {
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

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    setPhoneError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    if (!formData.phone) {
      setPhoneError('Phone number is required');
      return;
    }

    if (!isPhoneValid) {
      setPhoneError('Please enter a valid phone number for your country');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        phone: '+' + formData.phone
      };

      // 1. Update Provider specialized data
      if (provider) {
        await axios.patch(getApiUrl('api/provider/profile'), dataToSubmit);
      } else {
        await axios.post(getApiUrl('api/provider/profile'), dataToSubmit);
      }

      // 2. Update User base data (including avatar)
      await axios.patch(getApiUrl('api/auth/profile'), {
        name: formData.businessName, // Keep name in sync
        avatar: formData.avatar,
        phone: '+' + formData.phone,
      });

      alert('Profile updated successfully!');
      if (fetchUser) await fetchUser();
      setIsEditing(false);
      fetchProviderProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-300 pb-20 font-inter">
      {/* Simple Header */}
      <div className="relative h-48 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto px-6 h-full flex flex-col justify-center relative z-10 pt-4">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors self-start text-sm"
          >
            ← Back to Panel
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-6 items-center">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden relative border border-white/20">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.businessName?.charAt(0) || 'B'
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-2">
                  {formData.businessName || 'Business Name'}
                </h1>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-0.5 ${provider?.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-sm border border-white/5`}>
                    {provider?.isApproved ? '✓ ACTIVE' : '⏳ PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all text-xs"
              >
                Edit Portfolio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 mt-8 relative z-20">
        {!isEditing ? (
          /* VIEW MODE */
          <div className="grid lg:grid-cols-3 gap-6 items-start animate-fade-in-up">
            {/* Contact Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6 border border-slate-200/60 dark:border-neutral-800">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 dark:border-neutral-800/50 pb-3">Contact Info</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Phone</p>
                    <p className="text-slate-900 dark:text-neutral-100 font-semibold">+{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Email</p>
                    <p className="text-slate-900 dark:text-neutral-100 font-semibold truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About & Location Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-8 border border-slate-200/60 dark:border-neutral-800">
                <div className="space-y-10">
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-l-2 border-blue-500 pl-3">About Business</h3>
                    <p className="text-slate-600 dark:text-neutral-400 leading-relaxed text-base">
                      {formData.description || 'Welcome! Tell us about your business to attract more clients.'}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-l-2 border-blue-500 pl-3">Location</h3>
                    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50 dark:bg-neutral-950/50 p-6 rounded-xl border border-slate-100 dark:border-neutral-800/50">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Street</p>
                        <p className="text-slate-800 dark:text-neutral-200 text-sm font-medium">{formData.address.street || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">City & State</p>
                        <p className="text-slate-800 dark:text-neutral-200 text-sm font-medium">
                          {formData.address.city}, {formData.address.state || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Country</p>
                        <p className="text-slate-800 dark:text-neutral-200 text-sm font-medium">{formData.address.country || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">License Number</p>
                        <p className="text-slate-800 dark:text-neutral-200 text-sm font-mono">{formData.licenseNumber || 'Not available'}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-neutral-800 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold dark:text-white">Edit Portfolio</h2>
                <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors uppercase text-[10px] font-bold tracking-widest">Discard</button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Business Info</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight mb-2">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <PhoneInput
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      error={phoneError}
                      name="phone"
                      required={true}
                      setIsValid={setIsPhoneValid}
                    />
                    {phoneError && <p className="text-[11px] text-rose-500 font-semibold mt-2">{phoneError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight mb-2">Experience (Yrs)</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight mb-2">License #</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                        placeholder="LXXX-XXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Description & Location</h3>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white"
                    placeholder="Describe your service excellence..."
                  />

                  <div className="space-y-4">
                    <input
                      type="text"
                      name="address.street"
                      placeholder="Street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="address.city"
                        placeholder="City"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        name="address.state"
                        placeholder="State"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="address.zipCode"
                        placeholder="ZIP Code"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        name="address.country"
                        placeholder="Country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-neutral-800 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
