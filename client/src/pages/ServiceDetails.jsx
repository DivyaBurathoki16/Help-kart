import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LocationPicker from '../components/LocationPicker';

// Import static services
const STATIC_SERVICES = [
  { _id: 'static-1', title: 'Plumbing Repair', description: 'Expert plumbing services for leaks, clogs, and installations', price: 75, category: 'Plumbing', images: ['data:image/jpeg;base64,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'] },
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

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Scroll to top instantly when component mounts or id changes
    window.scrollTo({ top: 0, behavior: 'instant' });
    setImageError(false); // Reset image error state when service changes
    fetchService();
  }, [id]);

  const fetchService = async () => {
    // Check if it's a static service
    if (id && id.startsWith('static-')) {
      const staticService = STATIC_SERVICES.find(s => s._id === id);
      if (staticService) {
        // Format static service to match backend structure
        setService({
          ...staticService,
          category: { name: staticService.category },
          duration: 60, // Default duration for static services
          provider: null // Static services don't have providers
        });
        setLoading(false);
        return;
      }
    }

    // Try to fetch from backend
    try {
      const response = await axios.get(`http://localhost:5000/api/services/${id}`);
      setService(response.data.service);
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath; // Handle base64 images
    if (imagePath.startsWith('/')) return `http://localhost:5000${imagePath}`;
    return imagePath;
  };

  const handleBook = () => {
    if (!user) {
      navigate('/login', {
        state: { from: `/services/${id}` }
      });
    } else if (user.role === 'customer') {
      navigate(`/book/${id}`);
    } else {
      navigate('/login', {
        state: { from: `/services/${id}` }
      });
    }
  };

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
            onClick={() => navigate('/')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Go back to services
          </button>
        </div>
      </div>
    );
  }

  const rating = service.rating || service.provider?.rating || 0;
  const reviewCount = service.reviewCount || service.provider?.totalReviews || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-300 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-2 group transition-all duration-300"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        {/* Desktop Layout: 40/60 split with sticky image */}
        <div className="hidden md:flex gap-8 relative">
          {/* Left Column: Sticky Image (40%) */}
          <div className="w-[40%] flex-shrink-0">
            <div className="sticky top-8">
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-800 shadow-lg" style={{ maxHeight: '500px' }}>
                {service.images && service.images.length > 0 && !imageError ? (
                  <>
                    <img
                      src={getImageUrl(service.images[0])}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '500px' }}
                      onError={() => {
                        setImageError(true);
                      }}
                    />
                    {/* Rating Badge Overlay */}
                    {rating > 0 && (
                      <div className="absolute top-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-slate-200/50 dark:border-neutral-700/50">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <div>
                            <div className="text-lg font-bold text-slate-900 dark:text-neutral-100">{rating.toFixed(1)}</div>
                            <div className="text-xs text-slate-500 dark:text-neutral-400">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-[500px] bg-slate-200 dark:bg-neutral-700 flex items-center justify-center transition-colors duration-300">
                    <span className="text-slate-400 dark:text-neutral-500">No Image Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Scrollable Content (60%) */}
          <div className="w-[60%] flex-shrink-0 space-y-6">
            {/* Service Title and Category */}
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-neutral-100 mb-4 tracking-tight">
                {service.title}
              </h1>
              {service.category && (
                <span className="inline-block px-4 py-1.5 bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full text-sm font-medium">
                  {service.category.name}
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-neutral-300 font-medium text-lg">Price</span>
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">${service.price}</span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-slate-600 dark:text-neutral-300 font-medium">Duration</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{service.duration} minutes</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Description</h2>
              <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">{service.description}</p>
            </div>

            {/* Provider Card */}
            {service.provider && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Service Provider</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {service.provider.businessName?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-1">{service.provider.businessName}</p>
                    {service.provider.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="ml-1 text-sm font-semibold text-slate-900 dark:text-neutral-100">
                            {service.provider.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-neutral-400">
                          ({service.provider.totalReviews} {service.provider.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                    {service.provider.description && (
                      <p className="text-sm text-slate-600 dark:text-neutral-300 mt-2">{service.provider.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location with Map */}
            {service.location && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Service Location</h2>
                <LocationPicker
                  initialLocation={service.location}
                  readOnly={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout: Stacked vertically */}
        <div className="md:hidden space-y-6">
          {/* Image with Rating Badge */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-800 shadow-lg">
            {service.images && service.images.length > 0 && !imageError ? (
              <>
                <img
                  src={getImageUrl(service.images[0])}
                  alt={service.title}
                  className="w-full h-80 object-cover"
                  onError={() => {
                    setImageError(true);
                  }}
                />
                {/* Rating Badge Overlay */}
                {rating > 0 && (
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-slate-200/50 dark:border-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <div>
                        <div className="text-lg font-bold text-slate-900 dark:text-neutral-100">{rating.toFixed(1)}</div>
                        <div className="text-xs text-slate-500 dark:text-neutral-400">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-80 bg-slate-200 dark:bg-neutral-700 flex items-center justify-center transition-colors duration-300">
                <span className="text-slate-400 dark:text-neutral-500">No Image Available</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Service Title and Category */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-neutral-100 mb-4 tracking-tight">
                {service.title}
              </h1>
              {service.category && (
                <span className="inline-block px-4 py-1.5 bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full text-sm font-medium">
                  {service.category.name}
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-neutral-300 font-medium text-lg">Price</span>
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">${service.price}</span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-slate-600 dark:text-neutral-300 font-medium">Duration</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">{service.duration} minutes</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Description</h2>
              <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">{service.description}</p>
            </div>

            {/* Provider Card */}
            {service.provider && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Service Provider</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {service.provider.businessName?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-1">{service.provider.businessName}</p>
                    {service.provider.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="ml-1 text-sm font-semibold text-slate-900 dark:text-neutral-100">
                            {service.provider.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-neutral-400">
                          ({service.provider.totalReviews} {service.provider.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                    {service.provider.description && (
                      <p className="text-sm text-slate-600 dark:text-neutral-300 mt-2">{service.provider.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location with Map */}
            {service.location && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-4">Service Location</h2>
                <LocationPicker
                  initialLocation={service.location}
                  readOnly={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA Button (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-neutral-700 shadow-lg z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <PrimaryButton 
            onClick={handleBook} 
            className="w-full text-lg py-4" 
            icon="→" 
            iconPosition="right"
          >
            Book This Service
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
