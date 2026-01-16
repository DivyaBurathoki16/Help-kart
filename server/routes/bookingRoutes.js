import express from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import { protect, authorize } from '../middleware/auth.js';
import { applyAutoTransitions, getEventStartDateTime } from '../utils/bookingHelpers.js';

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

// @route   POST /api/bookings
// @desc    Create a new booking (CUSTOMER ONLY)
// @access  Private/Customer
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { service, bookingDate, bookingTime, address, phone, notes } = req.body;

    // Validation
    if (!service || !bookingDate || !bookingTime || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if service exists
    const serviceDoc = await Service.findById(service).populate('provider');
    if (!serviceDoc || !serviceDoc.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Parse and validate booking time format
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(bookingTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format (e.g., 14:00)'
      });
    }

    // Calculate time range for the new booking
    const requestedStartMinutes = timeToMinutes(bookingTime);
    const requestedEndMinutes = requestedStartMinutes + serviceDoc.duration;
    const normalizedBookingDate = normalizeDate(new Date(bookingDate));
    const providerId = serviceDoc.provider._id;

    // Check for conflicting CONFIRMED (accepted) bookings only
    // Allow multiple PENDING bookings - provider will decide which to accept
    // Only block if there's already a CONFIRMED booking for this slot
    const confirmedBookings = await Booking.find({
      provider: providerId,
      bookingDate: {
        $gte: normalizedBookingDate,
        $lt: new Date(normalizedBookingDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      },
      status: 'accepted', // Only check CONFIRMED bookings
    }).populate('service', 'duration');

    // Check each confirmed booking for time overlap
    for (const confirmedBooking of confirmedBookings) {
      const existingStartMinutes = timeToMinutes(confirmedBooking.bookingTime);

      // Get service duration from populated service
      const existingServiceDuration = confirmedBooking.service?.duration || 0;
      const existingEndMinutes = existingStartMinutes + existingServiceDuration;

      // Check if time ranges overlap
      if (timeRangesOverlap(
        requestedStartMinutes,
        requestedEndMinutes,
        existingStartMinutes,
        existingEndMinutes
      )) {
        return res.status(409).json({
          success: false,
          errorCode: 'BOOKING_SLOT_UNAVAILABLE',
          message: 'This time slot is already booked. Please choose a different time.',
        });
      }
    }

    // No conflicts found - create booking
    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      service: service,
      bookingDate: normalizedBookingDate,
      bookingTime,
      address: address || {},
      phone,
      notes: notes || '',
      status: 'pending',
      totalAmount: serviceDoc.price,
      // paymentStatus defaults to 'unpaid' - payment only after provider accepts
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('provider', 'businessName phone')
      .populate('service', 'title price duration');

    // Apply auto-transitions before returning
    await applyAutoTransitions(booking);

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get all bookings for logged-in customer
// @access  Private/Customer
router.get('/my', protect, authorize('customer'), async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('provider', 'businessName phone')
      .populate('service', 'title price duration images')
      .sort({ createdAt: -1 });

    // CRITICAL: Apply auto-transitions BEFORE sending response
    // This ensures status is always up-to-date (confirmed → in_progress, provider_completed → completed)
    for (const booking of bookings) {
      await applyAutoTransitions(booking);
    }

    // Refresh bookings to ensure we return the latest persisted state
    // This is important because applyAutoTransitions may have updated the DB
    const refreshedBookings = await Booking.find({ customer: req.user._id })
      .populate('provider', 'businessName phone')
      .populate('service', 'title price duration images')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings: refreshedBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/provider/:providerId/schedule
// @desc    Get provider's upcoming schedule (PUBLIC - for booking page)
// @access  Public
router.get('/provider/:providerId/schedule', async (req, res) => {
  try {
    const { providerId } = req.params;

    // Verify provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get bookings for next 30 days
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Fetch bookings for this provider
    const bookings = await Booking.find({
      provider: providerId,
      bookingDate: {
        $gte: today,
        $lte: thirtyDaysFromNow,
      },
      status: {
        $in: ['pending', 'accepted', 'confirmed', 'in_progress'], // Only active bookings
      },
    })
      .select('bookingDate bookingTime status service')
      .populate('service', 'title duration')
      .sort({ bookingDate: 1, bookingTime: 1 });

    // Format the schedule
    const schedule = bookings.map((booking) => ({
      date: booking.bookingDate,
      time: booking.bookingTime,
      duration: booking.service?.duration || 60,
      serviceName: booking.service?.title || 'Service',
      status: booking.status,
    }));

    res.json({
      success: true,
      schedule,
      message: `Found ${schedule.length} upcoming booking(s)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking (CUSTOMER ONLY)
// @access  Private/Customer
router.patch('/:id/cancel', protect, authorize('customer'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Disallowed states
    if (['in_progress', 'provider_completed', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this stage',
      });
    }

    // If already cancelled, be idempotent
    if (booking.status === 'cancelled_by_customer' || booking.status === 'cancelled') {
      return res.json({ success: true, message: 'Booking is already cancelled', booking });
    }

    const now = new Date();
    const eventTime = getEventStartDateTime(booking.bookingDate, booking.bookingTime);
    const hoursBeforeEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = 0;

    // Only consider refund for prepaid bookings
    if (booking.paymentStatus === 'paid') {
      const amount = booking.totalAmount || 0;

      if (hoursBeforeEvent >= 24) {
        // Full refund
        refundAmount = amount;
      } else if (hoursBeforeEvent >= 6) {
        // 50% refund window
        refundAmount = amount * 0.5;
      }
      // < 6h before event → no refund (keep 0)
    }

    booking.status = 'cancelled_by_customer';
    booking.cancelledBy = 'customer';
    booking.cancelledAt = now;
    booking.cancellationReason = req.body.reason || '';
    booking.refundAmount = refundAmount;
    booking.refundStatus = refundAmount > 0 ? 'pending' : 'none';

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('provider', 'businessName phone')
      .populate('service', 'title price duration images');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/bookings/:id/reschedule
// @desc    Reschedule a booking (CUSTOMER ONLY - for reschedule_requested bookings)
// @access  Private/Customer
router.patch('/:id/reschedule', protect, authorize('customer'), async (req, res) => {
  try {
    const { bookingDate, bookingTime } = req.body;

    // Validation
    if (!bookingDate || !bookingTime) {
      return res.status(400).json({ success: false, message: 'Please provide both date and time' });
    }

    // Find booking and verify it belongs to this customer
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify booking is in reschedule_requested status
    if (booking.status !== 'reschedule_requested') {
      return res.status(400).json({
        success: false,
        message: 'This booking is not eligible for rescheduling',
      });
    }

    // Parse and validate booking time format
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(bookingTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format (e.g., 14:00)',
      });
    }

    // Get service to check duration
    const serviceDoc = await Service.findById(booking.service).populate('provider');
    if (!serviceDoc || !serviceDoc.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Calculate time range for the new booking
    const requestedStartMinutes = timeToMinutes(bookingTime);
    const requestedEndMinutes = requestedStartMinutes + serviceDoc.duration;
    const normalizedBookingDate = normalizeDate(new Date(bookingDate));
    const providerId = serviceDoc.provider._id;

    // Check for conflicting CONFIRMED (accepted) bookings
    const confirmedBookings = await Booking.find({
      provider: providerId,
      bookingDate: {
        $gte: normalizedBookingDate,
        $lt: new Date(normalizedBookingDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: 'accepted',
      _id: { $ne: booking._id }, // Exclude current booking
    }).populate('service', 'duration');

    // Check each confirmed booking for time overlap
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
        return res.status(409).json({
          success: false,
          errorCode: 'BOOKING_SLOT_UNAVAILABLE',
          message: 'This time slot is already booked. Please choose a different time.',
        });
      }
    }

    // Update booking with new date/time and reset to pending
    booking.bookingDate = normalizedBookingDate;
    booking.bookingTime = bookingTime;
    booking.status = 'pending';
    booking.rescheduleMessage = ''; // Clear reschedule message
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('provider', 'businessName phone')
      .populate('service', 'title price duration');

    // Apply auto-transitions before returning
    await applyAutoTransitions(booking);

    res.json({
      success: true,
      booking: populatedBooking,
      message: 'Booking rescheduled successfully. Waiting for provider confirmation.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/pay
// @desc    Select payment method and process payment for an accepted booking (CUSTOMER ONLY)
// @access  Private/Customer
router.put('/:id/pay', protect, authorize('customer'), async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Validate payment method
    if (!paymentMethod || !['COD', 'UPI', 'CARD'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required. Must be COD, UPI, or CARD',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking belongs to the logged-in customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Security Rule: Cannot pay before acceptance
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted by provider before payment',
      });
    }

    // Security Rule: Cannot change payment method after confirmation
    if (booking.paymentMethod && booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Payment method cannot be changed after confirmation',
      });
    }

    // Apply auto-transitions before processing payment
    await applyAutoTransitions(booking);

    // Handle COD (Cash on Delivery)
    if (paymentMethod === 'COD') {
      booking.paymentMethod = 'COD';
      booking.paymentStatus = 'unpaid'; // Payment happens after service completion
      booking.status = 'confirmed';
      await booking.save();

      const populatedBooking = await Booking.findById(booking._id)
        .populate('service', 'title price duration')
        .populate('provider', 'businessName phone')
        .populate('customer', 'name email phone');

      return res.json({
        success: true,
        message: 'Booking confirmed. Pay after service completion.',
        booking: populatedBooking,
      });
    }

    // Handle Online Payment (UPI/CARD)
    if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
      // TODO: Integrate with Razorpay/Stripe here
      // For now, simulate payment success

      booking.paymentMethod = paymentMethod;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paidAt = new Date();
      booking.paymentId = `payment_${Date.now()}_${booking._id}`;
      await booking.save();

      const populatedBooking = await Booking.findById(booking._id)
        .populate('service', 'title price duration')
        .populate('provider', 'businessName phone')
        .populate('customer', 'name email phone');

      return res.json({
        success: true,
        message: 'Payment successful. Service pending.',
        booking: populatedBooking,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/bookings/:id/confirm-completion
// @desc    Customer confirms service completion (final confirmation)
// @access  Private/Customer
router.patch('/:id/confirm-completion', protect, authorize('customer'), async (req, res) => {
  try {
    // Find booking and verify it belongs to this customer
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Apply auto-transitions first
    await applyAutoTransitions(booking);

    // Reload booking to get updated status
    await booking.populate('service', 'title price duration');
    await booking.populate('provider', 'businessName phone');

    // Verify booking is in provider_completed status
    if (booking.status !== 'provider_completed') {
      return res.status(400).json({
        success: false,
        message: `Booking must be completed by provider first. Current status: ${booking.status}`,
      });
    }

    // Verify provider has marked it as completed
    if (!booking.providerCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Provider has not marked service as completed yet',
      });
    }

    // Customer confirms completion - final step
    booking.customerCompleted = true;
    booking.status = 'completed';
    booking.completedAt = new Date();
    booking.serviceStatus = 'completed';

    // Set issue reporting window (7 days after completion)
    const issueWindowExpiresAt = new Date();
    issueWindowExpiresAt.setHours(issueWindowExpiresAt.getHours() + 168);
    booking.issueWindowExpiresAt = issueWindowExpiresAt;

    // If COD and unpaid, mark payment as paid when customer confirms
    if (booking.paymentMethod === 'COD' && booking.paymentStatus === 'unpaid') {
      booking.paymentStatus = 'paid';
      booking.paidAt = new Date();
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
      .populate('provider', 'businessName phone')
      .populate('customer', 'name email phone');

    res.json({
      success: true,
      booking: populatedBooking,
      message: 'Service completion confirmed. Thank you!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/bookings/:id/report-issue
// @desc    Customer reports an issue with completed service (within 48h window)
// @access  Private/Customer
router.post('/:id/report-issue', protect, authorize('customer'), async (req, res) => {
  try {
    const { issueType, issueDescription, issueImages } = req.body;

    // Validation
    if (!issueType) {
      return res.status(400).json({ success: false, message: 'Issue type is required' });
    }

    const validIssueTypes = ['poor_quality', 'incomplete', 'damage', 'other'];
    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({ success: false, message: 'Invalid issue type' });
    }

    if (!issueDescription || issueDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Issue description is required (minimum 10 characters)'
      });
    }

    // Find booking and verify it belongs to this customer
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify booking is completed or provider_completed
    if (booking.status !== 'completed' && booking.status !== 'provider_completed') {
      return res.status(400).json({
        success: false,
        message: `Issue can only be reported for completed bookings. Current status: ${booking.status}`,
      });
    }

    // Verify issue window is still open (48 hours after completion)
    // Check either completedAt (final) or providerCompletedAt (provisional)
    const completionTime = booking.completedAt || booking.providerCompletedAt;

    if (!completionTime) {
      // If simply provider_completed recently, and timestamp missing (unlikely but safe check)
      // Allow reporting if status is correct
      if (booking.status === 'provider_completed') {
        // Pass through
      } else {
        return res.status(400).json({
          success: false,
          message: 'Booking completion date not found',
        });
      }
    }

    if (completionTime) {
      const now = new Date();
      const issueWindowExpiresAt = booking.issueWindowExpiresAt || new Date(completionTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      if (now > issueWindowExpiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Issue reporting window has expired. You can only report issues within 7 days of completion.',
        });
      }
    }

    // Check if issue already reported
    if (booking.status === 'issue_reported' || booking.issueReportedAt) {
      return res.status(400).json({
        success: false,
        message: 'An issue has already been reported for this booking',
      });
    }

    // Update booking with issue details
    booking.status = 'issue_reported';
    booking.issueReportedAt = new Date();
    booking.issueType = issueType;
    booking.issueDescription = issueDescription.trim();
    booking.customerProof = issueImages || []; // Map issueImages to customerProof

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
      .populate('provider', 'businessName phone')
      .populate('customer', 'name email phone');

    res.json({
      success: true,
      booking: populatedBooking,
      message: 'Issue reported successfully. Our team will review your proof against the provider\'s work.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/bookings/:id/complete-redo
// @desc    Provider completes redo service
// @access  Private/Provider
router.patch('/:id/complete-redo', protect, authorize('provider'), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify booking is in redo_required status
    if (booking.status !== 'redo_required') {
      return res.status(400).json({
        success: false,
        message: `Redo can only be completed for bookings requiring redo. Current status: ${booking.status}`,
      });
    }

    // Mark redo as completed
    booking.status = 'redo_completed';
    booking.redoCompleted = true;
    booking.redoCompletedAt = new Date();

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
      .populate('customer', 'name email phone');

    res.json({
      success: true,
      booking: populatedBooking,
      message: 'Redo service completed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
