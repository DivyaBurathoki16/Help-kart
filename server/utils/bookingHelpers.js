import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

/**
 * Helper function to convert time string (HH:MM) to minutes since midnight
 * @param {string} timeStr - Time in format "HH:MM" or "H:MM"
 * @returns {number} - Minutes since midnight (0-1439)
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Get the event start datetime from booking date and time
 * @param {Date} bookingDate - Booking date
 * @param {string} bookingTime - Time string in HH:MM format
 * @returns {Date} - Event start datetime
 */
export const getEventStartDateTime = (bookingDate, bookingTime) => {
  const eventStart = new Date(bookingDate);
  const [hours, minutes] = bookingTime.split(':').map(Number);
  eventStart.setHours(hours, minutes, 0, 0);
  return eventStart;
};

/**
 * Check if current time is at or past the event start time
 * @param {Date} bookingDate - Booking date
 * @param {string} bookingTime - Time string in HH:MM format
 * @param {number} bufferMinutes - Optional buffer in minutes (default: 0)
 * @returns {boolean} - True if event time has been reached
 */
export const isEventTimeReached = (bookingDate, bookingTime, bufferMinutes = 0) => {
  const eventStart = getEventStartDateTime(bookingDate, bookingTime);
  const now = new Date();
  const bufferMs = bufferMinutes * 60 * 1000;
  return now >= new Date(eventStart.getTime() - bufferMs);
};

/**
 * Check if booking can be completed (time-based validation)
 * @param {Object} booking - Booking document
 * @returns {Object} - { canComplete: boolean, message: string }
 */
export const canCompleteBooking = (booking) => {
  const now = new Date();
  const eventStart = getEventStartDateTime(booking.bookingDate, booking.bookingTime);

  if (now < eventStart) {
    return {
      canComplete: false,
      message: 'Cannot complete booking before event date & time',
    };
  }

  return {
    canComplete: true,
    message: 'Booking can be completed',
  };
};

/**
 * Auto-transition confirmed bookings to in_progress when event time is reached
 * This should be called when fetching bookings or via a cron job
 * CRITICAL: This function MUST save to database for persistence
 * @param {Object} booking - Booking document (Mongoose model instance)
 * @returns {Promise<Object|null>} - Updated booking or null if no change
 */
export const autoTransitionToInProgress = async (booking) => {
  try {
    // Only transition if status is exactly 'confirmed'
    if (booking.status !== 'confirmed') {
      return null;
    }

    // Check if event time has been reached
    const eventTimeReached = isEventTimeReached(booking.bookingDate, booking.bookingTime);

    if (eventTimeReached) {
      // Update status
      booking.status = 'in_progress';
      booking.serviceStatus = 'in_progress';

      // CRITICAL: Save to database - this is what was missing!
      await booking.save();

      console.log(`✅ Auto-transitioned booking ${booking._id} from confirmed → in_progress`);

      return booking;
    }

    return null;
  } catch (error) {
    console.error('Error in autoTransitionToInProgress:', error);
    throw error;
  }
};

/**
 * Auto-complete provider_completed bookings after 48 hours if customer hasn't confirmed
 * CRITICAL: This function MUST save to database for persistence
 * @param {Object} booking - Booking document (Mongoose model instance)
 * @returns {Promise<Object|null>} - Updated booking or null if no change
 */
export const autoCompleteAfterTimeout = async (booking) => {
  try {
    const AUTO_COMPLETE_TIMEOUT_MS = 48 * 60 * 60 * 1000; // 48 hours

    // Validate prerequisites
    if (
      booking.status !== 'provider_completed' ||
      !booking.providerCompleted ||
      !booking.providerCompletedAt ||
      booking.customerCompleted
    ) {
      return null;
    }

    const now = new Date();
    const timeSinceProviderCompleted = now.getTime() - new Date(booking.providerCompletedAt).getTime();

    if (timeSinceProviderCompleted >= AUTO_COMPLETE_TIMEOUT_MS) {
      // Update all completion fields
      const completedAt = new Date();
      booking.status = 'completed';
      booking.customerCompleted = true;
      booking.autoCompleted = true;
      booking.completedAt = completedAt;
      booking.serviceStatus = 'completed';

      // Set issue reporting window (7 days after completion)
      const issueWindowExpiresAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      booking.issueWindowExpiresAt = issueWindowExpiresAt;

      // If COD and unpaid, mark as paid
      if (booking.paymentMethod === 'COD' && booking.paymentStatus === 'unpaid') {
        booking.paymentStatus = 'paid';
        booking.paidAt = new Date();
      }

      // CRITICAL: Save to database - this is what was missing!
      await booking.save();

      console.log(`✅ Auto-completed booking ${booking._id} after 48h timeout`);

      return booking;
    }

    return null;
  } catch (error) {
    console.error('Error in autoCompleteAfterTimeout:', error);
    throw error;
  }
};

/**
 * Apply auto-transitions to a booking (call this when fetching bookings)
 * CRITICAL: This function MUST be called on every booking fetch to ensure state consistency
 * @param {Object} booking - Booking document (Mongoose model instance)
 * @returns {Promise<Object>} - Booking with auto-transitions applied and persisted
 */
export const applyAutoTransitions = async (booking) => {
  try {
    // Do not auto-transition cancelled bookings
    if (
      booking.status === 'cancelled' ||
      booking.status === 'cancelled_by_customer' ||
      booking.status === 'cancelled_by_provider'
    ) {
      return booking;
    }

    let wasUpdated = false;

    // First check for in_progress transition
    const inProgressResult = await autoTransitionToInProgress(booking);
    if (inProgressResult) {
      wasUpdated = true;
      // Reload to get fresh data after save
      await booking.populate('service', 'duration');
      await booking.populate('customer', 'name email phone');
    }

    // Then check for auto-completion (only if not already completed)
    if (booking.status !== 'completed') {
      const autoCompleteResult = await autoCompleteAfterTimeout(booking);
      if (autoCompleteResult) {
        wasUpdated = true;
        // Reload to get fresh data after save
        await booking.populate('service', 'duration');
        await booking.populate('customer', 'name email phone');
      }
    }

    // Ensure we return the booking with latest data
    // If it was updated, Mongoose should have the latest, but we ensure it's fresh
    if (wasUpdated) {
      // Refresh from DB to ensure consistency
      await booking.populate('service', 'duration');
      await booking.populate('customer', 'name email phone');
    }

    return booking;
  } catch (error) {
    // Log error but don't break the request
    console.error('Error applying auto-transitions to booking:', booking._id, error);
    return booking;
  }
};

/**
 * Apply auto-transitions to multiple bookings
 * @param {Array} bookings - Array of booking documents
 * @returns {Promise<Array>} - Bookings with auto-transitions applied
 */
export const applyAutoTransitionsToMany = async (bookings) => {
  const promises = bookings.map(booking => applyAutoTransitions(booking));
  await Promise.all(promises);
  return bookings;
};
