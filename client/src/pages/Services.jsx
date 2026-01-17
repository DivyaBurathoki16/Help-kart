import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import PageHeader from '../components/PageHeader';
import { getApiUrl } from '../config/api';
import API_URL from '../config/api';

// Sample locations for random assignment
const AREAS = ['Downtown', 'Midtown', 'Uptown', 'Westside', 'Eastside', 'North Park', 'South Bay', 'Central District', 'Riverside', 'Hillcrest', 'Oakwood', 'Maple Heights', 'Green Valley', 'Sunset Hills', 'Ocean View'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Fort Worth'];

// Helper function to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random rating (3.5 to 5.0)
const getRandomRating = () => {
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  return parseFloat(rating);
};

// Helper function to get random availability
const getRandomAvailability = () => {
  const statuses = ['online', 'busy', 'offline'];
  return getRandomItem(statuses);
};

// Static services that load regardless of backend status
const STATIC_SERVICES_BASE = [
  { _id: 'static-1', title: 'Plumbing Repair', description: 'Expert plumbing services for leaks, clogs, and installations', price: 75, category: 'Plumbing', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcAZo--21fAx2zHcbQbl1bfz0QqYKLCJCBcQ&s'] },
  { _id: 'static-2', title: 'Electrical Wiring', description: 'Professional electrical work and safety inspections', price: 120, category: 'Electrical', images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'] },
  { _id: 'static-3', title: 'Deep House Cleaning', description: 'Thorough cleaning service for your entire home', price: 150, category: 'Cleaning', images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'] },
  { _id: 'static-4', title: 'AC Installation', description: 'Professional AC unit installation and setup', price: 300, category: 'AC Repair', images: ['https://tiimg.tistatic.com/fp/2/008/507/air-conditioning-installation-service-in-west-bengal-655.jpg'] },
  { _id: 'static-5', title: 'Lawn Mowing', description: 'Regular lawn maintenance and grass cutting', price: 50, category: 'Lawn Care', images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'] },
  { _id: 'static-6', title: 'Interior Painting', description: 'Professional interior painting services', price: 200, category: 'Painting', images: ['https://tiimg.tistatic.com/fp/1/009/149/interior-painting-services-253.jpg'] },
  { _id: 'static-7', title: 'Custom Carpentry', description: 'Handcrafted furniture and custom woodwork', price: 250, category: 'Carpentry', images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'] },
  { _id: 'static-8', title: 'Car Oil Change', description: 'Quick and professional automotive oil change service', price: 40, category: 'Automotive', images: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'] },
  { _id: 'static-9', title: 'Bathroom Renovation', description: 'Complete bathroom remodeling and renovation', price: 500, category: 'Plumbing', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWTmiDpQe5MPGlfGRuDwzFjgDcnKgky4yknA&s'] },
  { _id: 'static-10', title: 'Light Fixture Installation', description: 'Install and repair lighting fixtures', price: 80, category: 'Electrical', images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400'] },
  { _id: 'static-11', title: 'Window Cleaning', description: 'Crystal clear window cleaning service', price: 60, category: 'Cleaning', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'] },
  { _id: 'static-12', title: 'AC Maintenance', description: 'Regular AC maintenance and tune-up', price: 100, category: 'AC Repair', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'] },
  { _id: 'static-13', title: 'Garden Landscaping', description: 'Professional garden design and landscaping', price: 350, category: 'Lawn Care', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdqRsEfWL0F3ZVYswhAgnm27MEwrkiCJl59Q&s'] },
  { _id: 'static-14', title: 'Exterior Painting', description: 'House exterior painting and weatherproofing', price: 400, category: 'Painting', images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'] },
  { _id: 'static-15', title: 'Cabinet Installation', description: 'Custom kitchen and bathroom cabinet installation', price: 450, category: 'Carpentry', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5bJSSeeoiaGcCBQW4dw1_FqNbXc1GqTl0zg&s'] },
  { _id: 'static-16', title: 'Tire Replacement', description: 'Professional tire replacement and balancing', price: 90, category: 'Automotive', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'] },
  { _id: 'static-17', title: 'Water Heater Repair', description: 'Fix and maintain your water heater system', price: 130, category: 'Plumbing', images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400'] },
  { _id: 'static-18', title: 'Smart Home Setup', description: 'Install and configure smart home devices', price: 180, category: 'Electrical', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXIUm0I1u6bYd4-nROJgQligZG8QPpk467tA&s'] },
  { _id: 'static-19', title: 'Carpet Cleaning', description: 'Deep steam cleaning for carpets and rugs', price: 110, category: 'Cleaning', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcUD32Nh4pIHxyGG_DfQHGNTUYq72hdQMq7g&s'] },
  { _id: 'static-20', title: 'AC Duct Cleaning', description: 'Thorough air duct cleaning and sanitization', price: 200, category: 'AC Repair', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTitAT5YgqmEpI6cDu7vmjSybcjHeSB9upoTw&s'] },
];

// Add random location, availability, and ratings to static services
const STATIC_SERVICES = STATIC_SERVICES_BASE.map(service => ({
  ...service,
  location: {
    area: getRandomItem(AREAS),
    city: getRandomItem(CITIES),
  },
  availability: getRandomAvailability(),
  rating: getRandomRating(),
  reviewCount: Math.floor(Math.random() * 200 + 10), // Random review count between 10-210
}));

const Services = () => {
  const [services, setServices] = useState(STATIC_SERVICES); // Start with static services
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    availability: '',
    minRating: '',
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;

      const response = await axios.get(getApiUrl('api/services'), { params });
      // Always merge with static services
      const backendServices = response.data.services || [];
      setServices([...STATIC_SERVICES, ...backendServices]);
    } catch (error) {
      console.error('Error fetching services:', error);
      // If backend fails, use only static services
      setServices(STATIC_SERVICES);
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
      // Use static categories if backend fails
      setCategories([
        { _id: 'cat-1', name: 'Plumbing' },
        { _id: 'cat-2', name: 'Electrical' },
        { _id: 'cat-3', name: 'Cleaning' },
        { _id: 'cat-4', name: 'AC Repair' },
        { _id: 'cat-5', name: 'Lawn Care' },
        { _id: 'cat-6', name: 'Painting' },
        { _id: 'cat-7', name: 'Carpentry' },
        { _id: 'cat-8', name: 'Automotive' },
      ]);
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
    
    // Category filter - static services use category name, backend services use category ID
    let matchesCategory = true;
    if (filters.category) {
      if (service._id && service._id.startsWith('static-')) {
        // Static service - match by category name
        const selectedCategory = categories.find(cat => cat._id === filters.category);
        matchesCategory = selectedCategory && service.category === selectedCategory.name;
      } else {
        // Backend service - match by category ID
        matchesCategory = service.category === filters.category || service.category?._id === filters.category;
      }
    }

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
                          <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            service.availability === 'online' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : service.availability === 'busy'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              service.availability === 'online' 
                                ? 'bg-emerald-500' 
                                : service.availability === 'busy'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}></span>
                            {service.availability.charAt(0).toUpperCase() + service.availability.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      {service.location && (
                        <div className="flex items-center gap-1.5 mb-3 text-slate-500 dark:text-neutral-400 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            {service.location.city || ''}{service.location.city && service.location.state ? ', ' : ''}{service.location.state || ''}
                          </span>
                        </div>
                      )}

                      {/* Rating */}
                      {(service.rating || service.provider?.rating) && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="ml-1 text-sm font-semibold text-slate-900 dark:text-neutral-100">
                              {service.rating || service.provider?.rating || '0.0'}
                            </span>
                          </div>
                          {(service.reviewCount || service.provider?.reviewCount) && (
                            <span className="text-xs text-slate-500 dark:text-neutral-400">
                              ({service.reviewCount || service.provider?.reviewCount || 0} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-slate-500 dark:text-neutral-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {service.description || 'Professional service by certified experts.'}
                      </p>

                      <div className="mt-auto flex items-baseline gap-1">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">${service.price}</span>
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
