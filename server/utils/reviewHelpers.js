import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import Service from '../models/Service.js';

/**
 * Handle all side effects that should happen when a review is deleted:
 * - Mark the related booking as not reviewed
 * - Recalculate provider rating and totalReviews from remaining reviews
 * - Recalculate service rating from remaining reviews
 */
export const handleReviewDeletionSideEffects = async (review) => {
  if (!review) return;

  const { provider, service, booking } = review;

  // 1. Reset booking.reviewed flag so customer can submit a new review
  if (booking) {
    const bookingDoc = await Booking.findById(booking);
    if (bookingDoc) {
      bookingDoc.reviewed = false;
      await bookingDoc.save();
    }
  }

  // 2. Recalculate provider rating & totalReviews
  if (provider) {
    const providerReviews = await Review.find({ provider });
    const providerDoc = await Provider.findById(provider);

    if (providerDoc) {
      if (!providerReviews.length) {
        providerDoc.rating = 0;
        providerDoc.totalReviews = 0;
      } else {
        const totalRating = providerReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = totalRating / providerReviews.length;
        providerDoc.rating = Number(averageRating.toFixed(2));
        providerDoc.totalReviews = providerReviews.length;
      }
      await providerDoc.save();
    }
  }

  // 3. Recalculate service rating purely from its own reviews
  if (service) {
    const serviceReviews = await Review.find({ service });
    const serviceDoc = await Service.findById(service);

    if (serviceDoc) {
      if (!serviceReviews.length) {
        serviceDoc.rating = 0;
      } else {
        const totalRating = serviceReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = totalRating / serviceReviews.length;
        serviceDoc.rating = Number(averageRating.toFixed(2));
      }
      await serviceDoc.save();
    }
  }
};

