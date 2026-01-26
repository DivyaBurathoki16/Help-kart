import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import LocationPicker from '../components/LocationPicker';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import ChatModal from '../components/ChatModal';
import { getApiUrl } from '../config/api';
import API_URL from '../config/api';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deleteReviewModal, setDeleteReviewModal] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  useEffect(() => {
    // Scroll to top instantly when component mounts or id changes
    window.scrollTo({ top: 0, behavior: 'instant' });
    setImageError(false); // Reset image error state when service changes
    fetchService();
  }, [id]);

  // Function to refetch reviews (can be called manually or on focus)
  const refetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const reviewsRes = await axios.get(getApiUrl(`api/reviews/service/${id}`));
      setReviews(reviewsRes.data.reviews || []);
    } catch (reviewsError) {
      console.error('Error refetching service reviews:', reviewsError);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  // Refetch reviews when window/tab regains focus (to catch admin deletions)
  useEffect(() => {
    if (!id) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refetch reviews when tab becomes visible
        refetchReviews();
      }
    };

    const handleFocus = () => {
      // Refetch reviews when window regains focus
      refetchReviews();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, refetchReviews]);

  const fetchService = async () => {
    try {
      const response = await axios.get(getApiUrl(`api/services/${id}`));
      const svc = response.data.service;
      setService(svc);

      // Fetch reviews for this service
      try {
        setReviewsLoading(true);
        const reviewsRes = await axios.get(getApiUrl(`api/reviews/service/${id}`));
        setReviews(reviewsRes.data.reviews || []);
      } catch (reviewsError) {
        console.error('Error fetching service reviews:', reviewsError);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
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
    if (imagePath.startsWith('/')) return `${API_URL}${imagePath}`;
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

  // Calculate rating from actual reviews array ONLY for service details
  // Don't use provider fallback to avoid confusion
  const rating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;

  // Only show rating if there are actual service reviews
  const shouldShowRating = reviewCount > 0 && rating > 0;

  const handleDeleteReviewClick = (review) => {
    setDeleteReviewModal(review);
  };

  const handleConfirmDeleteReview = async () => {
    if (!deleteReviewModal) return;

    try {
      setDeletingReview(true);
      await axios.delete(getApiUrl(`api/reviews/${deleteReviewModal._id}`));
      setReviews((prev) => prev.filter((r) => r._id !== deleteReviewModal._id));
      setDeleteReviewModal(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review. Please try again.');
    } finally {
      setDeletingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-300 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-2 group transition-all duration-300"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        {/* Desktop/Tablet Layout: 40/60 split with sticky image and scrollable info */}
        <div className="hidden md:flex md:gap-4 lg:gap-8 md:p-4 lg:p-6">
          {/* Left Column: Image (sticky on desktop only, not tablet) */}
          <div className="md:w-[50%] lg:w-[40%] flex-shrink-0">
            <div className="lg:sticky lg:top-8 self-start">
              <div className="relative aspect-square md:aspect-[3/4] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-800 shadow-lg" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                {service.images && service.images.length > 0 && !imageError ? (
                  <>
                    <img
                      src={getImageUrl(service.images[0])}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageError(true);
                      }}
                    />
                    {/* Rating Badge Overlay */}
                    {shouldShowRating && (
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
                  <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center transition-colors duration-300">
                    <span className="text-slate-400 dark:text-neutral-500">No Image Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Scrollable Content (50% on tablet, 60% on desktop) */}
          <div className="flex-1 md:w-[50%] lg:w-auto md:px-0 space-y-5 lg:space-y-6 md:flex md:flex-col">
            {/* Sticky wrapper - sizes naturally to content, max height when content is long */}
            <div className="sticky top-8 md:h-full md:min-h-0">
              {/* Content area - scrolls only if content exceeds viewport */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-3 md:pr-6 -mr-3 md:-mr-6 space-y-5 lg:space-y-6 md:h-full md:min-h-0" style={{ scrollbarWidth: 'thin' }}>
                {/* Service Title and Category */}
                <div>
                  {service.category && (
                    <span className="inline-block px-3 md:px-4 py-1.5 bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full text-xs md:text-sm font-medium mb-3 lg:mb-4">
                      {service.category.name}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-[2rem] lg:text-4xl font-extrabold text-slate-900 dark:text-neutral-100 mb-3 lg:mb-4 tracking-tight">
                    {service.title}
                  </h1>
                </div>

                {/* Pricing */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 md:p-6 lg:p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-neutral-300 font-medium text-base md:text-lg">Price</span>
                    <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">₹{service.price}</span>
                  </div>
                  <div className="mt-3 lg:mt-4 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-neutral-300 font-medium text-sm md:text-base">Duration</span>
                    <span className="font-semibold text-slate-900 dark:text-neutral-100 text-sm md:text-base">
                      {service.duration} minutes
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 md:p-6 lg:p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-neutral-100 mb-3 lg:mb-4">Description</h2>
                  <p className="text-sm md:text-base text-slate-600 dark:text-neutral-300 leading-relaxed">{service.description}</p>
                </div>

                {/* Provider Card */}
                {service.provider && (
                  <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 md:p-6 lg:p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-neutral-100 mb-3 lg:mb-4">Service Provider</h2>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {service.provider.businessName?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1">
                        <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-1">{service.provider.businessName}</p>
                        {/* Only show provider rating if THIS service has reviews to avoid confusion */}
                        {reviewCount > 0 && service.provider.rating > 0 && service.provider.totalReviews > 0 && (
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
                        {user && user.role === 'customer' && (
                          <button
                            onClick={() => setChatModalOpen(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Chat with Provider
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 md:p-6 lg:p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-neutral-100">
                      Customer Reviews
                    </h2>
                    <button
                      onClick={refetchReviews}
                      disabled={reviewsLoading}
                      className="p-2 text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh reviews"
                    >
                      <svg
                        className={`w-5 h-5 ${reviewsLoading ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  {reviewsLoading ? (
                    <p className="text-sm text-slate-600 dark:text-neutral-300">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-neutral-400">
                      No reviews yet. Be the first to book this service and share your experience.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border border-slate-200 dark:border-neutral-700 rounded-xl p-4 bg-slate-50/60 dark:bg-neutral-900/40"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                                {review.customer?.name || 'Verified customer'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-neutral-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-600'
                                    }`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
                              "{review.comment}"
                            </p>
                          )}
                          {user &&
                            user.role === 'customer' &&
                            review.customer &&
                            review.customer._id &&
                            review.customer._id === user._id && (
                              <button
                                onClick={() => handleDeleteReviewClick(review)}
                                className="mt-3 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                              >
                                Delete Review
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location with Map */}
                {service.location && (
                  <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 md:p-6 lg:p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-neutral-100 mb-3 lg:mb-4">Service Location</h2>
                    <LocationPicker
                      initialLocation={service.location}
                      readOnly={true}
                    />
                  </div>
                )}

                {/* Spacer for sticky bottom button */}
                <div className="h-6 md:h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet: Sticky Button (footer-aware) */}
        <div className="hidden md:block">
          <div className="sticky bottom-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t-2 border-slate-200 dark:border-neutral-700 shadow-2xl z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="max-w-7xl mx-auto flex justify-center">
              <div className="w-full max-w-md">
                <PrimaryButton
                  onClick={handleBook}
                  className="w-full text-base md:text-lg font-bold py-4 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
                  icon="→"
                  iconPosition="right"
                >
                  Book This Service
                </PrimaryButton>
              </div>
            </div>
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
                {shouldShowRating && (
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
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">₹{service.price}</span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-slate-600 dark:text-neutral-300 font-medium">Duration</span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">
                  {service.duration} minutes
                </span>
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
                    {/* Only show provider rating if THIS service has reviews to avoid confusion */}
                    {reviewCount > 0 && service.provider.rating > 0 && service.provider.totalReviews > 0 && (
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

            {/* Reviews Section */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                  Customer Reviews
                </h2>
                <button
                  onClick={refetchReviews}
                  disabled={reviewsLoading}
                  className="p-2 text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh reviews"
                >
                  <svg
                    className={`w-5 h-5 ${reviewsLoading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              {reviewsLoading ? (
                <p className="text-sm text-slate-600 dark:text-neutral-300">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  No reviews yet. Be the first to book this service and share your experience.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border border-slate-200 dark:border-neutral-700 rounded-xl p-4 bg-slate-50/60 dark:bg-neutral-900/40"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                            {review.customer?.name || 'Verified customer'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-600'
                                }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                      {user &&
                        user.role === 'customer' &&
                        review.customer &&
                        review.customer._id &&
                        review.customer._id === user._id && (
                          <button
                            onClick={() => handleDeleteReviewClick(review)}
                            className="mt-3 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                          >
                            Delete Review
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

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

          {/* Mobile: CTA Button */}
          <div className="sticky bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t-2 border-slate-200 dark:border-neutral-700 p-4 shadow-2xl z-40 -mx-4 sm:-mx-6">
            <div className="flex justify-center gap-3">
              {user && user.role === 'customer' && (
                <button
                  onClick={() => setChatModalOpen(true)}
                  className="px-4 py-4 bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 border border-slate-200 dark:border-neutral-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </button>
              )}
              <div className="flex-1 max-w-md">
                <PrimaryButton
                  onClick={handleBook}
                  className="w-full text-lg py-4 font-bold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30"
                  icon="→"
                  iconPosition="right"
                >
                  Book This Service
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Review Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteReviewModal}
        onClose={() => setDeleteReviewModal(null)}
        onConfirm={handleConfirmDeleteReview}
        title="Delete Review?"
        message="Are you sure you want to delete this review?"
        isLoading={deletingReview}
      />

      {/* Chat Modal */}
      {user && user.role === 'customer' && service && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          type="INQUIRY"
          serviceId={service._id}
          contextInfo={{
            serviceTitle: service.title,
          }}
        />
      )}
    </div>
  );
};

export default ServiceDetails;
