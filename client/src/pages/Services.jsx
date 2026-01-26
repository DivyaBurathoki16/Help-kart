import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import API_URL from '../config/api';

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]); // API-only services
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    availability: '',
    minRating: '',
    sortBy: '',
    maxDistance: '',
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.maxDistance) params.maxDistance = filters.maxDistance;

      const response = await axios.get(getApiUrl('api/services'), { params });
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setError(error.response?.data?.message || 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(getApiUrl('api/services/categories/list'));
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Helper function to format image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${API_URL}${imagePath}`;
    return imagePath;
  };

  // Get unique cities from services for filter dropdown
  const uniqueCities = [...new Set(services.map(service =>
    service.location?.city || service.provider?.location?.city || ''
  ).filter(Boolean))].sort();

  // Filter services based on all filters
  const filteredServices = services.filter(service => {
    // Search filter
    const matchesSearch = !filters.search ||
      service.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(filters.search.toLowerCase()));

    // Category filter (API services only)
    const matchesCategory = !filters.category ||
      service.category === filters.category ||
      service.category?._id === filters.category;

    // City filter
    const matchesCity = !filters.city ||
      (service.location?.city && service.location.city === filters.city) ||
      (service.provider?.location?.city && service.provider.location.city === filters.city);

    // Availability filter
    const matchesAvailability = !filters.availability ||
      (service.availability && service.availability.toLowerCase() === filters.availability.toLowerCase()) ||
      (service.provider?.availability && service.provider.availability.toLowerCase() === filters.availability.toLowerCase());

    // Rating filter
    const matchesRating = !filters.minRating ||
      (service.rating && parseFloat(service.rating) >= parseFloat(filters.minRating)) ||
      (service.provider?.rating && parseFloat(service.provider.rating) >= parseFloat(filters.minRating));

    return matchesSearch && matchesCategory && matchesCity && matchesAvailability && matchesRating;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Browse Services"
          subtitle="Discover trusted professionals in your area"
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
            <p className="text-sm text-rose-800 dark:text-rose-200 font-medium">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 -mt-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search services..."
            className="w-full px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              className="px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              className="px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            >
              <option value="">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              className="px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            >
              <option value="">All Availability</option>
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>

            {/* Rating Filter */}
            <select
              className="px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>

          {/* Sort and Distance Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sort By */}
            <select
              className="px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="">Sort by: Default</option>
              {user && user.location && (
                <option value="distance">Sort by: Distance (Nearest)</option>
              )}
              <option value="price">Sort by: Price (Lowest)</option>
              <option value="rating">Sort by: Rating (Highest)</option>
            </select>

            {/* Max Distance Filter (only show if user has location) */}
            {user && user.location && (
              <select
                className="px-5 py-3 border border-slate-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-slate-900 dark:text-neutral-100 transition-all duration-300"
                value={filters.maxDistance}
                onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
              >
                <option value="">All Distances</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            )}
          </div>

          {/* Location Notice */}
          {user && !user.location && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Tip:</strong> Add your location in your profile to see services sorted by distance from you!
              </p>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-neutral-300 text-lg">No services found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => {
              const bgColors = ['bg-[#fff7ed]', 'bg-[#fffbeb]', 'bg-[#f5f3ff]', 'bg-[#f0fdf4]', 'bg-[#eff6ff]', 'bg-[#fff1f2]'];
              const bgColor = bgColors[index % bgColors.length];

              return (
                <div key={service._id} className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-neutral-700 flex flex-col group hover:shadow-xl transition-all duration-500">
                  <Link to={`/services/${service._id}`} className="flex-1 flex flex-col">
                    {/* Header with Background Color and Centered Image */}
                    <div className={`relative h-48 ${bgColor} flex items-center justify-center p-8 transition-colors duration-500`}>
                      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110">
                        {service.images && service.images.length > 0 ? (
                          <img
                            src={getImageUrl(service.images[0])}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <span className="text-slate-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      {/* Title and Availability */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 line-clamp-1 flex-1">
                          {service.title}
                        </h3>
                        {/* Availability Badge */}
                        {service.availability && (
                          <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${service.availability === 'online'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : service.availability === 'busy'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-400'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${service.availability === 'online'
                              ? 'bg-emerald-500'
                              : service.availability === 'busy'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                              }`}></span>
                            {service.availability.charAt(0).toUpperCase() + service.availability.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* Location and Distance */}
                      {(service.location || service.distance !== undefined) && (
                        <div className="flex items-center gap-1.5 mb-3 text-slate-500 dark:text-neutral-400 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            {service.location?.city || ''}{service.location?.city && service.location?.state ? ', ' : ''}{service.location?.state || ''}
                            {service.distance !== undefined && service.distance !== null && (
                              <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                                • {service.distance.toFixed(1)} km away
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Rating */}
                      {((service.reviewCount || service.provider?.reviewCount || 0) > 0) ? (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="ml-1 text-sm font-semibold text-slate-900 dark:text-neutral-100">
                              {service.rating || service.provider?.rating || '0.0'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-neutral-400">
                            ({service.reviewCount || service.provider?.reviewCount || 0} reviews)
                          </span>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <span className="text-xs text-slate-400 dark:text-neutral-500 italic">No reviews yet</span>
                        </div>
                      )}

                      <p className="text-slate-500 dark:text-neutral-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {service.description || 'Professional service by certified experts.'}
                      </p>

                      <div className="mt-auto flex items-baseline gap-1">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{service.price}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
