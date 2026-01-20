import express from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import Service from '../models/Service.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleReviewDeletionSideEffects } from '../utils/reviewHelpers.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a review for a completed booking (CUSTOMER ONLY)
// @access  Private/Customer
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { bookingId, rating, comment, images } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID and rating are required' });
    }

    // Find booking and ensure it belongs to this customer
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    // Only allow review if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a service after it is marked as completed by the provider.',
      });
    }

    // Prevent duplicate reviews for the same booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview || booking.reviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking.',
      });
    }

    // Create review
    const review = await Review.create({
      customer: req.user._id,
      provider: booking.provider,
      service: booking.service,
      booking: booking._id,
      rating,
      comment: comment || '',
      images: Array.isArray(images) ? images : [],
    });

    // Mark booking as reviewed
    booking.reviewed = true;
    await booking.save();

    // Update provider's rating & totalReviews
    const provider = await Provider.findById(booking.provider);
    if (provider) {
      const currentTotal = provider.totalReviews || 0;
      const currentRating = provider.rating || 0;
      const newTotal = currentTotal + 1;
      const newRating = ((currentRating * currentTotal) + rating) / newTotal;

      provider.totalReviews = newTotal;
      provider.rating = Number(newRating.toFixed(2));
      await provider.save();
    }

    // Optionally update service rating as well (simple average based on totalBookings)
    const service = await Service.findById(booking.service);
    if (service) {
      const currentRating = service.rating || 0;
      const currentTotal = service.totalBookings || 0; // fallback if no dedicated review count
      const newTotal = currentTotal > 0 ? currentTotal : 1;
      const newRating = ((currentRating * (newTotal - 1)) + rating) / newTotal;
      service.rating = Number(newRating.toFixed(2));
      await service.save();
    }

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name')
      .populate('provider', 'businessName')
      .populate('service', 'title');

    res.status(201).json({
      success: true,
      review: populatedReview,
      message: 'Review submitted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reviews/service/:serviceId
// @desc    Get approved reviews for a service (PUBLIC)
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    const reviews = await Review.find({
      service: serviceId,
      isApproved: true,
    })
      .populate('customer', 'name email')
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review created by the logged-in customer
// @access  Private/Customer
router.delete('/:id', protect, authorize('customer'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      // Make delete idempotent - if review is already gone, respond success
      return res.json({
        success: true,
        message: 'Review already deleted.',
      });
    }

    // Ensure the review belongs to the logged-in customer
    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review',
      });
    }

    await handleReviewDeletionSideEffects(review);
    await Review.findByIdAndDelete(review._id);

    return res.json({
      success: true,
      message: 'Review deleted successfully. You can submit a new review for this booking if needed.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete review',
    });
  }
});

export default router;

