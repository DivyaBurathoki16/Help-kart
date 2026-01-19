import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import { getApiUrl } from '../../config/api';
import StaticServicesForm from './forms/StaticServicesForm';

const PAGES = [
  { slug: 'home', label: 'Home / Landing' },
  { slug: 'static-services', label: 'Static Services' },
  { slug: 'how-it-works', label: 'How It Works' },
  { slug: 'why-us', label: 'Why Us' },
  { slug: 'reviews', label: 'Reviews' },
];

const AdminContent = () => {
  const [activePage, setActivePage] = useState('home');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPageContent(activePage);
  }, [activePage]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPageContent = async (slug) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if API URL is configured
      const apiUrl = getApiUrl(`api/pages/${slug}`);
      if (!apiUrl || apiUrl.includes('undefined')) {
        throw new Error('API URL is not configured. Please check your environment variables.');
      }
      
      const response = await axios.get(apiUrl, {
        timeout: 10000, // 10 second timeout
      });
      
      // Handle response format
      const data = response.data?.data || response.data || {};
      setFormData(data);
    } catch (err) {
      console.error('Error loading page content:', err);
      
      let errorMessage = 'Failed to load page content.';
      let errorDetails = '';
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Cannot connect to the backend server.';
        errorDetails = 'Please ensure:\n1. The backend server is running (check terminal)\n2. Server is running on port 5000\n3. No firewall is blocking the connection';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out.';
        errorDetails = 'The server took too long to respond. Please check your connection and try again.';
      } else if (err.response) {
        errorMessage = err.response?.data?.message || `Server error: ${err.response.status}`;
        if (err.response.status === 404) {
          errorDetails = 'Page content not found. You can still edit and save new content.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`${errorMessage}${errorDetails ? `\n\n${errorDetails}` : ''}`);
      // Set empty form data to allow editing even if fetch fails
      setFormData({});
    } finally {
      setLoading(false);
    }
  };

  const updateField = useCallback((path, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const updateArrayField = useCallback((path, index, field, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      
      // Navigate to the parent of the array
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      // Handle the array
      const arrayKey = keys[keys.length - 1];
      const arr = current[arrayKey] || [];
      const newArr = [...arr];
      
      if (!newArr[index]) {
        newArr[index] = {};
      } else {
        newArr[index] = { ...newArr[index] };
      }
      
      newArr[index][field] = value;
      current[arrayKey] = newArr;
      
      return newData;
    });
  }, []);

  const addArrayItem = useCallback((path, defaultItem = {}) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      
      // Navigate to the parent of the array
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      // Handle the array
      const arrayKey = keys[keys.length - 1];
      const arr = current[arrayKey] || [];
      current[arrayKey] = [...arr, { ...defaultItem }];
      
      return newData;
    });
  }, []);

  const removeArrayItem = useCallback((path, index) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      
      // Navigate to the parent of the array
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) return prev;
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      // Handle the array removal
      const arrayKey = keys[keys.length - 1];
      const arr = current[arrayKey] || [];
      current[arrayKey] = arr.filter((_, i) => i !== index);
      
      return newData;
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to save content.');
      }
      
      const apiUrl = getApiUrl(`api/admin/pages/${activePage}`);
      const response = await axios.put(
        apiUrl,
        { data: formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000, // 15 second timeout for save operations
        }
      );
      
      const message = response.data?.message || 'Page content saved successfully!';
      showNotification(message, 'success');
      
      // Update formData with saved data if server returns it
      if (response.data?.page?.data) {
        setFormData(response.data.page.data);
      }
    } catch (err) {
      console.error('Error saving page content:', err);
      
      let errorMessage = 'Failed to save page content.';
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Cannot connect to the server. Please ensure the backend server is running.';
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 503) {
        errorMessage = 'Database is not connected. Please configure MONGODB_URI in your .env file.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderHomeForm = () => {
    const hero = formData.hero || {};
    const expertServices = formData.expertServices || {};
    const popularServices = formData.popularServices || {};
    const features = formData.features || {};
    const cta = formData.cta || {};

    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Hero Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Badge Text
              </label>
              <input
                type="text"
                value={hero.badgeText || ''}
                onChange={(e) => updateField('hero.badgeText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Trusted by 50,000+ happy customers"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Main Heading (Line 1)
              </label>
              <input
                type="text"
                value={hero.headingLine1 || ''}
                onChange={(e) => updateField('hero.headingLine1', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Reliable Local Services"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Heading Highlight (Line 2)
              </label>
              <input
                type="text"
                value={hero.headingHighlight || ''}
                onChange={(e) => updateField('hero.headingHighlight', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="at Your Doorstep"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={hero.description || ''}
                onChange={(e) => updateField('hero.description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="From plumbing to electrical, cleaning to repairs..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={hero.primaryCta?.label || ''}
                  onChange={(e) => updateField('hero.primaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Book a Service"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  value={hero.primaryCta?.link || ''}
                  onChange={(e) => updateField('hero.primaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/services"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={hero.secondaryCta?.label || ''}
                  onChange={(e) => updateField('hero.secondaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How It Works"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  value={hero.secondaryCta?.link || ''}
                  onChange={(e) => updateField('hero.secondaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/how-it-works"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Expert Services Section */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Expert Services Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={expertServices.title || ''}
                onChange={(e) => updateField('expertServices.title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Expert Services for Every Need"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Section Description
              </label>
              <textarea
                value={expertServices.description || ''}
                onChange={(e) => updateField('expertServices.description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Browse our wide range of professional home services..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={expertServices.ctaText || ''}
                onChange={(e) => updateField('expertServices.ctaText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="View all 50+ services"
              />
            </div>
          </div>
        </Card>

        {/* Popular Services Section */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Popular Services Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={popularServices.title || ''}
                onChange={(e) => updateField('popularServices.title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Popular Services"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Section Description
              </label>
              <textarea
                value={popularServices.description || ''}
                onChange={(e) => updateField('popularServices.description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Most booked services by our customers..."
              />
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Features Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Section Badge
              </label>
              <input
                type="text"
                value={features.badge || ''}
                onChange={(e) => updateField('features.badge', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Why HelpKart?"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Main Heading
              </label>
              <input
                type="text"
                value={features.heading || ''}
                onChange={(e) => updateField('features.heading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Quality you can trust, speed you can rely on."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.features?.items || []).map((feature, idx) => (
                <Card key={`feature-${idx}`} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-neutral-700">
                    <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">Feature {idx + 1}</h4>
                    <button
                      onClick={() => {
                        const items = formData.features?.items || [];
                        const newItems = items.filter((_, i) => i !== idx);
                        updateField('features.items', newItems);
                      }}
                      className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Title
                      </label>
                      <input
                        type="text"
                        value={feature.title || ''}
                        onChange={(e) => updateArrayField('features.items', idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={feature.description || ''}
                        onChange={(e) => updateArrayField('features.items', idx, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <button
              onClick={() => addArrayItem('features.items', { title: '', description: '', color: 'violet' })}
              className="w-full px-4 py-2.5 border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-xl text-slate-600 dark:text-neutral-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold text-sm"
            >
              + Add Feature
            </button>
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Call-to-Action Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Heading
              </label>
              <input
                type="text"
                value={cta.heading || ''}
                onChange={(e) => updateField('cta.heading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ready to find the help you need?"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={cta.description || ''}
                onChange={(e) => updateField('cta.description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Join thousands of customers..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={cta.primaryCta?.label || ''}
                  onChange={(e) => updateField('cta.primaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Get Started Today"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  value={cta.primaryCta?.link || ''}
                  onChange={(e) => updateField('cta.primaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/register"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={cta.secondaryCta?.label || ''}
                  onChange={(e) => updateField('cta.secondaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Become a Professional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  value={cta.secondaryCta?.link || ''}
                  onChange={(e) => updateField('cta.secondaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/become-provider"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };


  const renderStaticServicesForm = () => {
    return (
      <StaticServicesForm
        formData={formData}
        updateArrayField={updateArrayField}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
      />
    );
  };

  const renderHowItWorksForm = () => {
    const customerSteps = formData.customerSteps || [];
    const providerSteps = formData.providerSteps || [];
    const cta = formData.cta || {};

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Page Header
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Subtitle
              </label>
              <textarea
                value={formData.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Customer Section
          </h3>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Customer Intro Text
            </label>
            <input
              type="text"
              value={formData.customerIntro || ''}
              onChange={(e) => updateField('customerIntro', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Book trusted services in a few steps."
            />
          </div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            <h4 className="text-lg font-bold text-slate-900 dark:text-neutral-100">Customer Steps</h4>
            <button
              onClick={() => addArrayItem('customerSteps', { title: '', description: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add Step
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerSteps.map((step, idx) => (
              <Card key={`customer-step-${idx}`} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-neutral-700">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">Step {idx + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('customerSteps', idx)}
                    className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => updateArrayField('customerSteps', idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={step.description || ''}
                      onChange={(e) => updateArrayField('customerSteps', idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Provider Section
          </h3>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
              Provider Intro Text
            </label>
            <input
              type="text"
              value={formData.providerIntro || ''}
              onChange={(e) => updateField('providerIntro', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Manage requests, jobs, and earnings with clarity."
            />
          </div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            <h4 className="text-lg font-bold text-slate-900 dark:text-neutral-100">Provider Steps</h4>
            <button
              onClick={() => addArrayItem('providerSteps', { title: '', description: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add Step
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerSteps.map((step, idx) => (
              <Card key={`provider-step-${idx}`} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-neutral-700">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">Step {idx + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('providerSteps', idx)}
                    className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => updateArrayField('providerSteps', idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={step.description || ''}
                      onChange={(e) => updateArrayField('providerSteps', idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Bottom CTA Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Heading
              </label>
              <input
                type="text"
                value={cta.heading || ''}
                onChange={(e) => updateField('cta.heading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={cta.description || ''}
                onChange={(e) => updateField('cta.description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={cta.primaryCta?.label || ''}
                  onChange={(e) => updateField('cta.primaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  value={cta.primaryCta?.link || ''}
                  onChange={(e) => updateField('cta.primaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={cta.secondaryCta?.label || ''}
                  onChange={(e) => updateField('cta.secondaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  value={cta.secondaryCta?.link || ''}
                  onChange={(e) => updateField('cta.secondaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderWhyUsForm = () => {
    const stats = formData.stats || [];
    const reasons = formData.reasons || [];
    const cta = formData.cta || {};

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Page Header
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Subtitle
              </label>
              <textarea
                value={formData.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">Stats</h3>
            <button
              onClick={() => addArrayItem('stats', { label: '', value: '', color: 'blue' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add Stat
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <Card key={`stat-${idx}`} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-neutral-700">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">Stat {idx + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('stats', idx)}
                    className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => updateArrayField('stats', idx, 'label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Value
                    </label>
                    <input
                      type="text"
                      value={stat.value || ''}
                      onChange={(e) => updateArrayField('stats', idx, 'value', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">Reasons</h3>
            <button
              onClick={() => addArrayItem('reasons', { title: '', description: '', color: 'blue' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add Reason
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reasons.map((reason, idx) => (
              <Card key={`reason-${idx}`} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-neutral-700">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">Reason {idx + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('reasons', idx)}
                    className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={reason.title || ''}
                      onChange={(e) => updateArrayField('reasons', idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={reason.description || ''}
                      onChange={(e) => updateArrayField('reasons', idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Final CTA Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Heading
              </label>
              <input
                type="text"
                value={cta.heading || ''}
                onChange={(e) => updateField('cta.heading', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={cta.description || ''}
                onChange={(e) => updateField('cta.description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={cta.primaryCta?.label || ''}
                  onChange={(e) => updateField('cta.primaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  value={cta.primaryCta?.link || ''}
                  onChange={(e) => updateField('cta.primaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={cta.secondaryCta?.label || ''}
                  onChange={(e) => updateField('cta.secondaryCta.label', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  value={cta.secondaryCta?.link || ''}
                  onChange={(e) => updateField('cta.secondaryCta.link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderReviewsForm = () => {
    const reviews = formData.reviews || [];
    const ctas = formData.ctas || [];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            Page Header
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2">
                Subtitle
              </label>
              <textarea
                value={formData.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">Top CTAs</h3>
            <button
              onClick={() => addArrayItem('ctas', { label: '', link: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add CTA
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ctas.map((cta, idx) => (
              <Card key={`cta-${idx}`} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-neutral-700">
                  <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">CTA {idx + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('ctas', idx)}
                    className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Label
                    </label>
                    <input
                      type="text"
                      value={cta.label || ''}
                      onChange={(e) => updateArrayField('ctas', idx, 'label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                      Link
                    </label>
                    <input
                      type="text"
                      value={cta.link || ''}
                      onChange={(e) => updateArrayField('ctas', idx, 'link', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">Reviews</h3>
            <button
              onClick={() => addArrayItem('reviews', { name: '', service: '', rating: 5, text: '', date: '', avatar: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add Review
            </button>
          </div>
          {reviews.length === 0 ? (
            <Card className="p-12 border-2 border-dashed border-slate-300 dark:border-neutral-700">
              <div className="text-center text-slate-500 dark:text-neutral-400">
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="text-sm mt-1">Click "Add Review" to create one.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {reviews.map((review, idx) => (
                <Card key={`review-${idx}`} className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-neutral-700">
                    <h4 className="font-bold text-slate-900 dark:text-neutral-100 text-base">Review {idx + 1}</h4>
                    <button
                      onClick={() => removeArrayItem('reviews', idx)}
                      className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={review.name || ''}
                        onChange={(e) => updateArrayField('reviews', idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Service Category
                      </label>
                      <input
                        type="text"
                        value={review.service || ''}
                        onChange={(e) => updateArrayField('reviews', idx, 'service', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={review.rating || ''}
                        onChange={(e) => updateArrayField('reviews', idx, 'rating', Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Date
                      </label>
                      <input
                        type="text"
                        value={review.date || ''}
                        onChange={(e) => updateArrayField('reviews', idx, 'date', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                        placeholder="2 weeks ago"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                        Review Text
                      </label>
                      <textarea
                        value={review.text || ''}
                        onChange={(e) => updateArrayField('reviews', idx, 'text', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderForm = useCallback(() => {
    switch (activePage) {
      case 'home':
        return renderHomeForm();
      case 'static-services':
        return renderStaticServicesForm();
      case 'how-it-works':
        return renderHowItWorksForm();
      case 'why-us':
        return renderWhyUsForm();
      case 'reviews':
        return renderReviewsForm();
      default:
        return <div>Unknown page</div>;
    }
  }, [activePage, formData]);

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            } text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[260px]`}
          >
            <span className="font-semibold text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
            Site Content Manager
          </h2>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Edit copy and static sections for your marketing pages without redeploying.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchPageContent(activePage)}
            disabled={loading || saving}
            className="px-4 py-2.5 border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors text-sm"
          >
            Reload
          </button>
          <PrimaryButton onClick={handleSave} disabled={saving || loading} className="px-6 py-2.5">
            {saving ? 'Saving...' : 'Save Changes'}
          </PrimaryButton>
        </div>
      </div>

      {/* Page selector pills */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map((page) => (
          <button
            key={page.slug}
            onClick={() => setActivePage(page.slug)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              activePage === page.slug
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-200 border-slate-200 dark:border-neutral-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {error && (
        <Card className="p-4 border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error Loading Content</h4>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={() => fetchPageContent(activePage)}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-neutral-400">Loading content...</p>
          </div>
        </Card>
      ) : (
        renderForm()
      )}
    </div>
  );
};

export default AdminContent;
