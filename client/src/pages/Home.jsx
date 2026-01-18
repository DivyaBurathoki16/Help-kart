import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(getApiUrl('api/services/categories/list'));
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Popular services from static services
  const popularServices = [
    { _id: 'static-1', title: 'Plumbing Repair', description: 'Expert plumbing services for leaks, clogs, and installations', price: 75, category: 'Plumbing', images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcAZo--21fAx2zHcbQbl1bfz0QqYKLCJCBcQ&s'] },
    { _id: 'static-2', title: 'Electrical Wiring', description: 'Professional electrical work and safety inspections', price: 120, category: 'Electrical', images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'] },
    { _id: 'static-3', title: 'Deep House Cleaning', description: 'Thorough cleaning service for your entire home', price: 150, category: 'Cleaning', images: ['https://scrubnbubbles.com/nitropack_static/QfrgyUUevySXtFoyvtyThjzNOkOfUEbA/assets/images/optimized/rev-508ce78/scrubnbubbles.com/wp-content/uploads/2020/07/how-to-keep-your-house-clean.jpg'] },
    { _id: 'static-4', title: 'AC Installation', description: 'Professional AC unit installation and setup', price: 300, category: 'AC Repair', images: ['https://tiimg.tistatic.com/fp/2/008/507/air-conditioning-installation-service-in-west-bengal-655.jpg'] },
    { _id: 'static-5', title: 'Lawn Mowing', description: 'Regular lawn maintenance and grass cutting', price: 50, category: 'Lawn Care', images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'] },
    { _id: 'static-6', title: 'Interior Painting', description: 'Professional interior painting services', price: 200, category: 'Painting', images: ['https://tiimg.tistatic.com/fp/1/009/149/interior-painting-services-253.jpg'] },
  ];

  // Category to image mapping using actual service images
  const categoryImages = {
    'Plumbing': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcAZo--21fAx2zHcbQbl1bfz0QqYKLCJCBcQ&s',
    'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    'Cleaning': 'https://scrubnbubbles.com/nitropack_static/QfrgyUUevySXtFoyvtyThjzNOkOfUEbA/assets/images/optimized/rev-508ce78/scrubnbubbles.com/wp-content/uploads/2020/07/how-to-keep-your-house-clean.jpg',
    'Home Cleaning': 'https://scrubnbubbles.com/nitropack_static/QfrgyUUevySXtFoyvtyThjzNOkOfUEbA/assets/images/optimized/rev-508ce78/scrubnbubbles.com/wp-content/uploads/2020/07/how-to-keep-your-house-clean.jpg',
    'AC Repair': 'https://tiimg.tistatic.com/fp/2/008/507/air-conditioning-installation-service-in-west-bengal-655.jpg',
    'Lawn Care': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    'Gardening': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSriOtRFb7CFLwDdlgBEM87AfBTjUEBoN9V-g&s',
    'Painting': 'https://tiimg.tistatic.com/fp/1/009/149/interior-painting-services-253.jpg',
    'Carpentry': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
  };

  const features = [
    {
      title: "Easy Discovery",
      description: "Find the perfect service provider with smart search and instant filters.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "violet"
    },
    {
      title: "Verified Experts",
      description: "Every professional is background-checked and vetted for quality assurance.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "rose"
    },
    {
      title: "Seamless Booking",
      description: "Book, track, and pay for services in just a few taps - all in one place.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "indigo"
    }
  ];

  return (
    <div className="relative isolate">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image & Gradient Overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="/hero-bg.png"
            alt="Service Professional"
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: 'right top',
              width: '100%',
              height: '100%'
            }}
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
            }}
          />
          {/* Enhanced gradient overlay - darker on left, fades to right to show person on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/80 to-blue-700/35"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 pb-20 lg:pt-32 lg:pb-32">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Trust Indicator */}
            <div className="mb-6 lg:mb-8">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white bg-white/10 backdrop-blur-md ring-1 ring-white/20">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Trusted by 50,000+ happy customers
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 lg:mb-8">
              Reliable Local Services <br />
              <span className="text-blue-200">at Your Doorstep</span>
            </h1>

            {/* Descriptive Text */}
            <p className="text-lg sm:text-xl leading-relaxed text-white/95 max-w-xl mb-10 lg:mb-12 font-medium">
              From plumbing to electrical, cleaning to repairs — get verified professionals at your home with just a few clicks. Fast, affordable, and hassle-free.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <Link 
                to="/services" 
                className="bg-[#2563eb] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-2xl shadow-blue-500/40 hover:bg-blue-600 hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2 group"
              >
                Book a Service
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                to="/how-it-works" 
                className="px-8 py-4 rounded-xl text-lg font-bold text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center gap-2 group backdrop-blur-sm"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Services Section */}
      <section className="py-20 bg-slate-50 dark:bg-neutral-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-neutral-100 mb-4">
              Expert Services for Every Need
            </h2>
            <p className="text-lg text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Browse our wide range of professional home services, delivered by verified experts in your area.
            </p>
          </div>

          {loadingCategories ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-neutral-300">Loading services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {categories.slice(0, 8).map((category, index) => {
                const serviceDescriptions = {
                  'Plumbing': 'Leaks, repairs & installations',
                  'Electrical': 'Wiring, fixtures & repairs',
                  'Cleaning': 'Deep clean & sanitization',
                  'Home Cleaning': 'Professional service by certified experts',
                  'AC Repair': 'Service & maintenance',
                  'Lawn Care': 'Mowing, trimming & maintenance',
                  'Gardening': 'Professional service by certified experts',
                  'Painting': 'Interior & exterior painting',
                  'Carpentry': 'Custom woodwork & repairs',
                  'Automotive': 'Car repair & maintenance'
                };

                const bgColors = [
                  'bg-[#fff7ed]', // Plumbing - warm
                  'bg-[#fffbeb]', // Electrical - yellow
                  'bg-[#f5f3ff]', // Cleaning - purple
                  'bg-[#f0fdf4]', // AC Repair - green
                  'bg-[#eff6ff]', // Lawn Care - blue
                  'bg-[#fff1f2]', // Painting - rose
                  'bg-[#fef3c7]', // Carpentry - amber
                  'bg-[#e0e7ff]'  // Automotive - indigo
                ];

                const categoryImage = categoryImages[category.name];
                
                return (
                  <Link
                    key={category._id}
                    to={`/services?category=${category._id}`}
                    className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className={`h-48 ${bgColors[index % bgColors.length]} flex items-center justify-center p-6`}>
                      <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-110 relative">
                        {categoryImage && !imageErrors[category._id] ? (
                          <img
                            src={categoryImage}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors(prev => ({ ...prev, [category._id]: true }));
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-slate-500 dark:text-neutral-400 text-sm">
                        {serviceDescriptions[category.name] || 'Professional service by certified experts'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
              View all 50+ services
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-20 bg-white dark:bg-neutral-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-neutral-100 mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Most booked services by our customers. Quick, reliable, and affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {popularServices.map((service, index) => {
              const bgColors = ['bg-[#fff7ed]', 'bg-[#fffbeb]', 'bg-[#f5f3ff]', 'bg-[#f0fdf4]', 'bg-[#eff6ff]', 'bg-[#fff1f2]'];
              const bgColor = bgColors[index % bgColors.length];

              return (
                <Link
                  key={service._id}
                  to={`/services/${service._id}`}
                  className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-neutral-700 flex flex-col group hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Header with Background Color and Centered Image */}
                  <div className={`relative h-48 ${bgColor} flex items-center justify-center p-8 transition-colors duration-500`}>
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110">
                      {service.images && service.images.length > 0 ? (
                        <img
                          src={service.images[0]}
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

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-2 line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 dark:text-neutral-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-auto flex items-baseline gap-1">
                      <span className="text-2xl font-black text-blue-600">₹{service.price}</span>
                      <span className="text-sm text-slate-500 dark:text-neutral-400">starting</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
              View all services
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-50 dark:bg-neutral-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-24">
            <h2 className="text-lg font-black leading-7 text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-4">Why HelpKart?</h2>
            <p className="text-5xl font-black tracking-tight text-slate-900 dark:text-neutral-100 sm:text-6xl">
              Quality you can trust, speed you can rely on.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
            {features.map((feature, idx) => {
              const colorClasses = {
                violet: 'bg-violet-600 shadow-violet-500/30',
                rose: 'bg-rose-600 shadow-rose-500/30',
                indigo: 'bg-indigo-600 shadow-indigo-500/30'
              };
              const bgColorClasses = {
                violet: 'bg-violet-500/5',
                rose: 'bg-rose-500/5',
                indigo: 'bg-indigo-500/5'
              };
              
              return (
                <div key={idx} className="card p-10 group hover:-translate-y-3 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${bgColorClasses[feature.color]} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
                  <div className={`w-20 h-20 mb-10 rounded-3xl ${colorClasses[feature.color]} flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-all duration-500`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-neutral-100 mb-6">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-neutral-300 text-lg leading-relaxed font-medium">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-slate-50 dark:bg-neutral-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="card bg-slate-900 p-12 sm:p-24 relative overflow-hidden border-none">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-rose-600/30"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-8">
                Ready to find the help you need?
              </h2>
              <p className="text-xl leading-10 text-slate-300 mb-12 font-medium">
                Join thousands of customers who have simplified their lives with HelpKart. Fast, reliable, and always at your service.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register" className="btn btn-primary px-12 py-5 text-xl shadow-2xl shadow-violet-500/40 w-full sm:w-auto">
                  Get Started Today
                </Link>
                <Link to="/become-provider" className="text-white hover:text-rose-400 font-bold text-lg transition-colors py-4 px-8 border-2 border-white/10 rounded-2xl hover:bg-white/5">
                  Become a Professional &rarr;
                </Link>
              </div>
            </div>
            {/* Abstract light detail */}
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

