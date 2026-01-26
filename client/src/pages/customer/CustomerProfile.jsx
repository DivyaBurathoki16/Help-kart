import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';
import { getApiUrl } from '../../config/api';
import PhoneInput from '../../components/ui/PhoneInput';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: null,
        avatar: '',
    });
    const [phoneError, setPhoneError] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState(false);

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
                avatar: userData.avatar || '',
            });
            setAvatarPreview(userData.avatar || null);
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
            await axios.patch(getApiUrl('api/auth/profile'), {
                name: formData.name,
                phone: '+' + formData.phone,
                location: formData.location,
                avatar: formData.avatar,
            });
            alert('Profile updated successfully!');
            if (fetchUser) {
                await fetchUser();
            }
            setIsEditing(false);
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
                    <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-300 pb-20 font-inter">
            {/* Header / Banner */}
            <div className="relative h-56 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full -ml-32 -mb-32 blur-[100px]"></div>
                </div>
                <div className="max-w-4xl mx-auto px-6 h-full flex flex-col justify-center relative z-10 pt-4">
                    <button
                        onClick={() => navigate('/customer/dashboard')}
                        className="text-white/60 hover:text-white flex items-center gap-2 transition-all self-start mb-4 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Personal Board
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-blue-400 rounded-full shadow-lg shadow-blue-500/50"></div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">Your Profile Hub</h2>
                    </div>
                </div>
            </div>

            {/* Profile Content Wrapper */}
            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-neutral-800 p-10 backdrop-blur-sm">
                    {/* Top Section with Avatar & Quick Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-12 border-b border-slate-100 dark:border-neutral-800">
                        <div className="flex items-center gap-8">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/30 overflow-hidden relative border-2 border-white/10">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'
                                    )}
                                    {isEditing && (
                                        <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-lg rounded-lg p-1.5 text-white border border-white/30 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        <div className="flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Change Photo</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-neutral-100 mb-2 tracking-tight">
                                    {isEditing ? 'Redesigning Profile' : (formData.name || 'Anonymous User')}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Verified Member
                                    </div>
                                    <span className="text-slate-400 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-widest">• Customer Account</span>
                                </div>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-8 py-4 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 rounded-[1.25rem] font-black shadow-xl shadow-black/5 hover:-translate-y-1 hover:bg-slate-50 dark:hover:bg-neutral-800/80 transition-all flex items-center gap-3 group border-b-4 border-slate-200 active:border-b-0 active:translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile details
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        /* VIEW MODE */
                        <div className="space-y-16 animate-fade-in-up">
                            <div className="grid md:grid-cols-2 gap-12 items-stretch">
                                <div className="space-y-10 flex flex-col h-full bg-slate-50/50 dark:bg-neutral-950/30 p-8 rounded-[2rem] border border-slate-100 dark:border-neutral-800/50 shadow-inner">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Contact Identity</h2>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="group">
                                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-black uppercase mb-2 tracking-widest pl-1">Legal Full Name</p>
                                            <p className="text-slate-900 dark:text-neutral-100 font-bold text-xl group-hover:text-blue-600 transition-colors pl-1 tracking-tight">{formData.name || 'Persona not set'}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-black uppercase mb-2 tracking-widest pl-1">Digital Email</p>
                                            <p className="text-slate-900 dark:text-neutral-100 font-bold text-xl group-hover:text-blue-600 transition-colors pl-1 tracking-tight truncate">{user?.email}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-black uppercase mb-2 tracking-widest pl-1">Primary Connection</p>
                                            <p className="text-slate-900 dark:text-neutral-100 font-bold text-xl group-hover:text-blue-600 transition-colors pl-1 tracking-tight">+{formData.phone || 'Connection pending'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-2 px-1">
                                        <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                                        <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Service Location</h2>
                                    </div>
                                    <div className="flex flex-col flex-grow h-full bg-white dark:bg-neutral-900/50 rounded-[2rem] border border-slate-200 dark:border-neutral-800 p-8 shadow-xl shadow-black/5 group hover:shadow-indigo-500/5 transition-all">
                                        {formData.location ? (
                                            <div className="flex flex-col h-full space-y-6">
                                                <div className="flex gap-5 items-start">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-slate-900 dark:text-neutral-100 line-clamp-2 leading-[1.1] mb-2 tracking-tight">
                                                            {formData.location.address || 'Standard Hub Address'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                            {formData.location.city}, {formData.location.state}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-auto pt-8 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>Hub Verification</span>
                                                    <span className="text-blue-600 font-black italic">Active Area</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10 opacity-60">
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-slate-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-500 dark:text-neutral-400 italic font-medium">Domain geo-location not established</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* EDIT MODE */
                        <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in-up">
                            <div className="grid md:grid-cols-2 gap-12 items-start">
                                <div className="space-y-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Identity Refinement</h2>
                                    </div>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-black text-slate-600 dark:text-neutral-400 uppercase tracking-widest mb-3 pl-1">Full Identity Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-6 py-5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 text-slate-900 dark:text-neutral-100 transition-all outline-none font-bold text-lg"
                                                placeholder="Enter your full legal name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-600 dark:text-neutral-400 uppercase tracking-widest mb-3 pl-1">Mobile Access Line</label>
                                            <PhoneInput
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                error={phoneError}
                                                name="phone"
                                                required={true}
                                                setIsValid={setIsPhoneValid}
                                            />
                                            {phoneError && <p className="text-[11px] text-rose-500 font-black uppercase mt-3 pl-1 tracking-wider italic">⚠ {phoneError}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                                        <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Geo-Domain Mapping</h2>
                                    </div>
                                    <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-xl shadow-black/5 hover:border-indigo-400/50 transition-all focus-within:ring-8 focus-within:ring-indigo-500/5">
                                        <LocationPicker
                                            onLocationChange={handleLocationChange}
                                            initialLocation={formData.location}
                                            readOnly={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-12 border-t border-slate-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-8 py-5 border-2 border-slate-100 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-slate-900 transition-all active:scale-[0.98]"
                                >
                                    Discard Redesign
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] shadow-2xl shadow-blue-500/30 hover:-translate-y-1 hover:shadow-blue-500/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Persisting...
                                        </>
                                    ) : (
                                        'Commit Profile Improvements'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
