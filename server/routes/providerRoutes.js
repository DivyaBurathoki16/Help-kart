import express from 'express';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { canCompleteBooking, applyAutoTransitions } from '../utils/bookingHelpers.js';
<<<<<<< HEAD
import { sendBookingStatusEmail } from '../utils/emailService.js';
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

const router = express.Router();

/**
 * Helper function to convert time string (HH:MM) to minutes since midnight
 * @param {string} timeStr - Time in format "HH:MM" or "H:MM"
 * @returns {number} - Minutes since midnight (0-1439)
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Helper function to check if two time ranges overlap
 * @param {number} start1 - Start time in minutes
 * @param {number} end1 - End time in minutes
 * @param {number} start2 - Start time in minutes
 * @param {number} end2 - End time in minutes
 * @returns {boolean} - True if ranges overlap
 */
const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

/**
 * Helper function to normalize date to start of day (for comparison)
 * @param {Date} date - Date object
 * @returns {Date} - Date at 00:00:00
 */
const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Check if a booking conflicts with existing CONFIRMED (accepted) bookings
 * @param {Object} booking - Booking object with bookingDate, bookingTime, provider, service
 * @param {Object} serviceDoc - Service document with duration
 * @param {string} excludeBookingId - Booking ID to exclude from conflict check (for updates)
 * @returns {Promise<boolean>} - True if conflict exists
 */
const hasConflictWithConfirmedBookings = async (booking, serviceDoc, excludeBookingId = null) => {
  const normalizedBookingDate = normalizeDate(booking.bookingDate);
  const requestedStartMinutes = timeToMinutes(booking.bookingTime);
  const requestedEndMinutes = requestedStartMinutes + serviceDoc.duration;

  const query = {
    provider: booking.provider,
    bookingDate: {
      $gte: normalizedBookingDate,
      $lt: new Date(normalizedBookingDate.getTime() + 24 * 60 * 60 * 1000),
    },
    status: 'accepted', // Only check CONFIRMED bookings
  };

  // Exclude the current booking if updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const confirmedBookings = await Booking.find(query).populate('service', 'duration');

  for (const confirmedBooking of confirmedBookings) {
    const existingStartMinutes = timeToMinutes(confirmedBooking.bookingTime);
    const existingServiceDuration = confirmedBooking.service?.duration || 0;
    const existingEndMinutes = existingStartMinutes + existingServiceDuration;

    if (timeRangesOverlap(
      requestedStartMinutes,
      requestedEndMinutes,
      existingStartMinutes,
      existingEndMinutes
    )) {
      return true; // Conflict found
    }
  }

  return false; // No conflict
};

// Helper function to get or create provider profile
const getOrCreateProvider = async (userId) => {
  let provider = await Provider.findOne({ user: userId });
  if (!provider) {
    // Get user to get their phone number
    const user = await User.findById(userId);
    // Auto-create a basic provider profile if it doesn't exist
    provider = await Provider.create({
      user: userId,
      businessName: user?.name || 'My Business',
      phone: user?.phone || '000-000-0000', // Use user's phone or default
    });
  }
  return provider;
};

// @route   GET /api/provider/profile
// @desc    Get provider profile
// @access  Private/Provider
router.get('/profile', protect, authorize('provider'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate('category', 'name')
      .populate('user', 'name email');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/provider/profile
// @desc    Create provider profile
// @access  Private/Provider
router.post('/profile', protect, authorize('provider'), async (req, res) => {
  try {
    // Check if profile already exists
    const existingProvider = await Provider.findOne({ user: req.user._id });
    if (existingProvider) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists' });
    }

    const { businessName, description, phone, address, yearsOfExperience, licenseNumber } = req.body;

    if (!businessName || !phone) {
      return res.status(400).json({ success: false, message: 'Business name and phone are required' });
    }

    const provider = await Provider.create({
      user: req.user._id,
      businessName,
      description,
      phone,
      address: address || {},
      yearsOfExperience: yearsOfExperience || 0,
      licenseNumber,
    });

    const populatedProvider = await Provider.findById(provider._id)
      .populate('category', 'name')
      .populate('user', 'name email');

    res.status(201).json({ success: true, provider: populatedProvider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/provider/profile
// @desc    Update provider profile
// @access  Private/Provider
router.patch('/profile', protect, authorize('provider'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { businessName, description, phone, address, yearsOfExperience, licenseNumber } = req.body;

    if (businessName) provider.businessName = businessName;
    if (description !== undefined) provider.description = description;
    if (phone) provider.phone = phone;
    if (address) provider.address = { ...provider.address, ...address };
    if (yearsOfExperience !== undefined) provider.yearsOfExperience = yearsOfExperience;
    if (licenseNumber !== undefined) provider.licenseNumber = licenseNumber;

    await provider.save();

    const populatedProvider = await Provider.findById(provider._id)
      .populate('category', 'name')
      .populate('user', 'name email');

    res.json({ success: true, provider: populatedProvider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/provider/categories
// @desc    Create a custom category (PROVIDER ONLY)
// @access  Private/Provider
router.post('/categories', protect, authorize('provider'), async (req, res) => {
  try {
    const provider = await getOrCreateProvider(req.user._id);

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if global category already exists (provider: null)
    const existingCategory = await Category.findOne({
      name: name.trim(),
      provider: null,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }

    // Create global custom category (visible to all providers and users)
    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      isCustom: true,
      createdBy: req.user._id,
      provider: null, // Global category - visible to everyone
      isActive: true,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/provider/services
// @desc    Get all services for logged-in provider
// @access  Private/Provider
router.get('/services', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Get all services for this provider
    const services = await Service.find({ provider: provider._id })
      .populate('category', 'name isCustom')
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/provider/bookings
// @desc    Get all bookings for logged-in provider
// @access  Private/Provider
router.get('/bookings', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Get all bookings for this provider
    const bookings = await Booking.find({ provider: provider._id })
      .populate('service', 'title price duration')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    // CRITICAL: Apply auto-transitions BEFORE sending response
    // This ensures status is always up-to-date (confirmed → in_progress, provider_completed → completed)
    for (const booking of bookings) {
      await applyAutoTransitions(booking);
    }

    // Refresh bookings to ensure we return the latest persisted state
    // This is important because applyAutoTransitions may have updated the DB
    const refreshedBookings = await Booking.find({ provider: provider._id })
      .populate('service', 'title price duration')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings: refreshedBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/provider/bookings/:id
// @desc    Update booking status (Accept/Reject)
// @access  Private/Provider
router.patch('/bookings/:id', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { status } = req.body;

    // Validate status
    if (!['accepted', 'rejected', 'completed', 'cancelled', 'cancelled_by_provider'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Find booking and verify it belongs to this provider
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Special handling for accepting a booking
    if (status === 'accepted') {
      // Get service to check duration for conflict detection
      const serviceDoc = await Service.findById(booking.service);
      if (!serviceDoc) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }

      // Check for conflicts with other CONFIRMED bookings
      const hasConflict = await hasConflictWithConfirmedBookings(
        booking,
        serviceDoc,
        booking._id.toString()
      );

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is already confirmed for another booking. Please reject this booking or choose another time.',
        });
      }

      // Find conflicting PENDING bookings (but don't auto-reject them)
      const normalizedBookingDate = normalizeDate(booking.bookingDate);
      const bookingStartMinutes = timeToMinutes(booking.bookingTime);
      const bookingEndMinutes = bookingStartMinutes + serviceDoc.duration;

      // Find all other pending bookings for this provider on this date
      const pendingBookings = await Booking.find({
        provider: provider._id,
        bookingDate: {
          $gte: normalizedBookingDate,
          $lt: new Date(normalizedBookingDate.getTime() + 24 * 60 * 60 * 1000),
        },
        status: 'pending',
        _id: { $ne: booking._id }, // Exclude the booking being accepted
      }).populate('service', 'duration').populate('customer', 'name email');

      // Identify conflicting bookings
      const conflictingBookings = [];
      for (const pendingBooking of pendingBookings) {
        const pendingStartMinutes = timeToMinutes(pendingBooking.bookingTime);
        const pendingServiceDuration = pendingBooking.service?.duration || 0;
        const pendingEndMinutes = pendingStartMinutes + pendingServiceDuration;

        // Check if time ranges overlap
        if (timeRangesOverlap(
          bookingStartMinutes,
          bookingEndMinutes,
          pendingStartMinutes,
          pendingEndMinutes
        )) {
          conflictingBookings.push({
            id: pendingBooking._id,
            customerName: pendingBooking.customer?.name || 'Unknown',
            customerEmail: pendingBooking.customer?.email || '',
            bookingTime: pendingBooking.bookingTime,
            bookingDate: pendingBooking.bookingDate,
            serviceTitle: pendingBooking.service?.title || 'Service',
          });
        }
      }

      // If there are conflicts, return them to frontend for provider decision
      if (conflictingBookings.length > 0) {
        return res.json({
          success: false,
          requiresConflictResolution: true,
          bookingId: booking._id,
          conflicts: conflictingBookings,
          message: `This booking conflicts with ${conflictingBookings.length} other pending request(s). Please choose how to handle them.`,
        });
      }

      // No conflicts - accept immediately
      booking.status = 'accepted';
      booking.paymentStatus = 'unpaid'; // Payment now required after acceptance
      await booking.save();

      // Apply auto-transitions before returning
      await applyAutoTransitions(booking);

      const populatedBooking = await Booking.findById(booking._id)
        .populate('service', 'title price duration')
<<<<<<< HEAD
        .populate('customer', 'name email phone')
        .populate('provider', 'businessName');

      // Notify customer that provider accepted the booking
      try {
        await sendBookingStatusEmail(populatedBooking, 'accepted');
      } catch (notifyError) {
        console.error('Error sending booking accepted email:', notifyError);
        // Do not fail the main request if email fails
      }
=======
        .populate('customer', 'name email phone');
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

      return res.json({
        success: true,
        booking: populatedBooking,
        message: 'Booking accepted successfully.',
      });
    }

    // Handle other status updates (rejected, cancelled)
    // Note: 'completed' status is now handled via /complete endpoint with dual confirmation
    if (status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Use /complete endpoint to mark service as completed. This requires customer confirmation.',
      });
    }

    booking.status = status === 'cancelled' ? 'cancelled_by_provider' : status;
    if (status === 'cancelled' || status === 'cancelled_by_provider') {
      booking.cancelledBy = 'provider';
      booking.cancelledAt = new Date();
    }
    await booking.save();

    // Apply auto-transitions before returning
    await applyAutoTransitions(booking);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
      .populate('customer', 'name email phone');

    res.json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/provider/bookings/:id/complete
// @desc    Provider marks service as completed (requires customer confirmation)
// @access  Private/Provider
router.patch('/bookings/:id/complete', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Find booking and verify it belongs to this provider
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Apply auto-transitions first (e.g., confirmed → in_progress)
    await applyAutoTransitions(booking);

    // Reload booking to get updated status
    await booking.populate('service', 'duration');
    await booking.populate('customer', 'name email phone');

    // Verify booking is in_progress (system auto-transitions confirmed → in_progress at event time)
    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Booking must be in progress to mark as completed. Current status: ${booking.status}`,
      });
    }

    // 🔒 CRITICAL: Time-based validation - prevent early completion
    const validation = canCompleteBooking(booking);
    if (!validation.canComplete) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { proofOfWork } = req.body;

    // Require Proof of Work images
    if (!proofOfWork || !Array.isArray(proofOfWork) || proofOfWork.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Proof of work images are required to complete the service',
      });
    }

    // Finalize completion (No longer requires customer confirmation)
    booking.providerCompleted = true;
    booking.providerCompletedAt = new Date();
    booking.proofOfWork = proofOfWork; // Store proof of work
    booking.status = 'completed'; // Direct to completed
    booking.completedAt = new Date();
    booking.serviceStatus = 'completed';

    // Set issue reporting window (7 days after completion)
    const issueWindowExpiresAt = new Date();
    issueWindowExpiresAt.setHours(issueWindowExpiresAt.getHours() + 168);
    booking.issueWindowExpiresAt = issueWindowExpiresAt;

    // 💡 Automatically complete payment for COD bookings
    if (booking.paymentMethod === 'COD') {
      booking.paymentStatus = 'paid';
      booking.paidAt = new Date();
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
      .populate('customer', 'name email phone');

    res.json({
      success: true,
      booking: populatedBooking,
      message: 'Service marked as completed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/provider/bookings/:id/resolve-conflicts
// @desc    Resolve conflicts when accepting a booking (Provider decision)
// @access  Private/Provider
router.post('/bookings/:id/resolve-conflicts', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const { action, conflictIds, rescheduleMessage } = req.body;

    // Validate action
    if (!['reject', 'reschedule'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be "reject" or "reschedule"' });
    }

    if (!Array.isArray(conflictIds) || conflictIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Conflict IDs are required' });
    }

    // Find the booking being accepted and verify it belongs to this provider
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify booking is still pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in pending status' });
    }

    // Get service to verify conflicts still exist
    const serviceDoc = await Service.findById(booking.service);
    if (!serviceDoc) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check for conflicts with CONFIRMED bookings (safety check)
    const hasConflict = await hasConflictWithConfirmedBookings(
      booking,
      serviceDoc,
      booking._id.toString()
    );

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is now confirmed for another booking. Cannot proceed.',
      });
    }

    // Find conflicting bookings and verify they belong to this provider
    const conflictingBookings = await Booking.find({
      _id: { $in: conflictIds },
      provider: provider._id,
      status: 'pending',
    });

    if (conflictingBookings.length !== conflictIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some conflict IDs are invalid or do not belong to you',
      });
    }

    // Apply provider's decision
    const defaultRescheduleMessage = 'This slot is unavailable. Please choose another time slot.';
    const message = rescheduleMessage || defaultRescheduleMessage;

    if (action === 'reject') {
      // Reject conflicting bookings
      await Booking.updateMany(
        { _id: { $in: conflictIds } },
        { status: 'rejected' }
      );
    } else if (action === 'reschedule') {
      // Request reschedule for conflicting bookings
      await Booking.updateMany(
        { _id: { $in: conflictIds } },
        {
          status: 'reschedule_requested',
          rescheduleMessage: message,
        }
      );
    }

    // Now accept the booking
    booking.status = 'accepted';
    booking.paymentStatus = 'unpaid'; // Payment now required after acceptance
    await booking.save();

    // Apply auto-transitions before returning
    await applyAutoTransitions(booking);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
<<<<<<< HEAD
      .populate('customer', 'name email phone')
      .populate('provider', 'businessName');

    // Notify customer that provider accepted the booking
    try {
      await sendBookingStatusEmail(populatedBooking, 'accepted');
    } catch (notifyError) {
      console.error('Error sending booking accepted email (conflict resolution):', notifyError);
    }
=======
      .populate('customer', 'name email phone');
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

    res.json({
      success: true,
      booking: populatedBooking,
      action,
      conflictsHandled: conflictingBookings.length,
      message: action === 'reject'
        ? `Booking accepted. ${conflictingBookings.length} conflicting booking(s) rejected.`
        : `Booking accepted. ${conflictingBookings.length} customer(s) requested to reschedule.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/provider/services/:id
// @desc    Update a service
// @access  Private/Provider
router.patch('/services/:id', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Find service and verify it belongs to this provider
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update service
    const { title, description, category, price, duration, images, primaryImage, isActive, location } = req.body;

    if (title) service.title = title;
    if (description) service.description = description;
    if (category) service.category = category;
    if (price !== undefined) service.price = Number(price);
    if (duration !== undefined) service.duration = Number(duration);
    if (images !== undefined) {
      service.images = images;
      // Set primary image (first image or explicitly provided)
      service.primaryImage = primaryImage || (images && images.length > 0 ? images[0] : '');
    }
    if (primaryImage !== undefined) service.primaryImage = primaryImage;
    if (isActive !== undefined) service.isActive = isActive;
    if (location !== undefined) service.location = location;

    await service.save();

    const populatedService = await Service.findById(service._id)
      .populate('category', 'name');

    res.json({ success: true, service: populatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/provider/services/:id
// @desc    Delete a service
// @access  Private/Provider
router.delete('/services/:id', protect, authorize('provider'), async (req, res) => {
  try {
    // Get provider profile from user
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Find service and verify it belongs to this provider
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if there are any pending or accepted bookings
    const activeBookings = await Booking.find({
      service: service._id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active bookings. Please complete or cancel bookings first.',
      });
    }

    await Service.findByIdAndDelete(service._id);

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
