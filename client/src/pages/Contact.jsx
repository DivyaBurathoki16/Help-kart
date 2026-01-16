import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setShowToast(false);

    try {
      const response = await axios.post('http://localhost:5000/api/contact', formData);
      
      if (response.data.success) {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setToastMessage(response.data.message || 'Your message has been sent successfully!');
        setToastType('success');
        setShowToast(true);
        
        // Hide toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setToastMessage(
        error.response?.data?.message || 
        'Failed to send message. Please try again later.'
      );
      setToastType('error');
      setShowToast(true);
      
      // Hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`${
            toastType === 'success' 
              ? 'bg-green-500' 
              : 'bg-red-500'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[400px]`}>
            {toastType === 'success' ? (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <div>
              <p className="font-bold">{toastType === 'success' ? 'Success!' : 'Error!'}</p>
              <p className="text-sm">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <PageHeader
          title="Contact Us"
          subtitle="Have a question or need help? We're here to assist you. Reach out to us and we'll respond as soon as possible."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-neutral-950/50 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-1">Email</h3>
                    <a href="mailto:helpkart8990@gmail.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                     helpkart8990@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-1">Phone</h3>
                    <a href="tel:+91 9373799196" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      +91 9373799196
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-1">Business Hours</h3>
                    <p className="text-slate-600 dark:text-neutral-300">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-slate-600 dark:text-neutral-300">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-slate-600 dark:text-neutral-300">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-neutral-950/50 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Quick Links</h2>
              <ul className="space-y-3">
                <li>
                  <Link to="/services" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Browse Services →
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-blue-600 hover:text-blue-700 transition-colors">
                    How It Works →
                  </Link>
                </li>
                <li>
                  <Link to="/become-provider" className="text-blue-600 hover:text-blue-700 transition-colors">
                    Become a Provider →
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className="text-blue-600 hover:text-blue-700 transition-colors">
                    Customer Reviews →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-neutral-950/50 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-6">Send us a Message</h2>
            

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-text"
                  placeholder="Your name"
                  style={{ caretColor: '#3b82f6' }}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-text"
                  placeholder="your.email@example.com"
                  style={{ caretColor: '#3b82f6' }}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-text"
                  placeholder="What is this regarding?"
                  style={{ caretColor: '#3b82f6' }}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none cursor-text"
                  placeholder="Tell us how we can help..."
                  style={{ caretColor: '#3b82f6' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-blue-500/30 ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section - Below Contact Section */}
        <div className="mt-12 md:mt-16 animate-fade-in-up">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl dark:shadow-neutral-950/50 p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4 md:mb-6">Our Location</h2>
            
            {/* Map - Responsive Height */}
            <div className="rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 shadow-md h-[320px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
              <MapContainer
                center={[19.2036, 72.8567]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                className="rounded-xl md:rounded-2xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[19.2036, 72.8567]}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold text-slate-900 dark:text-neutral-100 mb-1">Thakur College of Science and Commerce</h3>
                      <p className="text-sm text-slate-600 dark:text-neutral-300">Kandivali East, Mumbai</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Address and Hours Info - Enhanced Mobile Layout */}
            <div className="pt-4 md:pt-6 border-t border-slate-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-8">
                {/* Location Card */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-0 bg-slate-50 dark:bg-neutral-800 sm:bg-transparent dark:sm:bg-transparent rounded-xl sm:rounded-none transition-all hover:bg-slate-50 dark:hover:bg-neutral-800 sm:hover:bg-transparent dark:sm:hover:bg-transparent">
                  <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-neutral-100 text-base sm:text-base mb-1">Thakur College of Science and Commerce</p>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">Kandivali East, Mumbai</p>
                  </div>
                </div>

                {/* Business Hours Card */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-0 bg-slate-50 dark:bg-neutral-800 sm:bg-transparent dark:sm:bg-transparent rounded-xl sm:rounded-none transition-all hover:bg-slate-50 dark:hover:bg-neutral-800 sm:hover:bg-transparent dark:sm:hover:bg-transparent">
                  <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-neutral-100 text-base sm:text-base mb-1">Business Hours</p>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">Mon–Sat: 9am–6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
