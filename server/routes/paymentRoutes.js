import express from 'express';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/payments/create
// @desc    Create payment intent for a booking
// @access  Private/Customer
router.post('/create', protect, authorize('customer'), async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID is required' 
      });
    }

    // Find booking and verify it belongs to this customer
    const booking = await Booking.findById(bookingId)
      .populate('service', 'title price')
      .populate('provider', 'businessName');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Rule 1: Block payment if booking is not accepted
    if (booking.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking not confirmed yet. Payment can only be processed after provider accepts the booking.' 
      });
    }

    // Rule 2: Prevent double payment
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking is already paid' 
      });
    }

    // Verify booking belongs to the logged-in customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to process payment for this booking' 
      });
    }

    // Set payment status to pending (payment in progress)
    booking.paymentStatus = 'pending';
    await booking.save();

    // TODO: In production, integrate with payment gateway (Razorpay/Stripe)
    // For now, return a test payment URL
    // In production, this would create a payment intent and return:
    // - Payment intent ID
    // - Client secret (for Stripe) or order ID (for Razorpay)
    // - Amount, Currency
    // - For Razorpay: orderId, key
    // - For Stripe: clientSecret, publishableKey
    
    const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${booking._id}`;
    
    res.json({
      success: true,
      message: 'Payment intent created successfully',
      paymentUrl, // URL to redirect user to payment page
      payment: {
        bookingId: booking._id,
        amount: booking.totalAmount,
        currency: 'INR', // Adjust based on your requirements
        // paymentIntentId: 'pi_xxx', // From payment gateway
        // clientSecret: 'pi_xxx_secret_xxx', // For Stripe
        // orderId: 'order_xxx', // For Razorpay
      },
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        service: booking.service,
        provider: booking.provider,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment (called by payment gateway webhook or frontend callback)
// @access  Private/Customer or Webhook (adjust based on your payment gateway)
router.post('/verify', protect, authorize('customer'), async (req, res) => {
  try {
    const { bookingId, paymentId, paymentStatus } = req.body;

    if (!bookingId || !paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID and Payment ID are required' 
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Verify booking belongs to the logged-in customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Verify booking is in pending payment status
    if (booking.paymentStatus !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment status. Expected 'pending', got '${booking.paymentStatus}'` 
      });
    }

    // TODO: Verify payment with payment gateway (Razorpay/Stripe)
    // In production, verify the payment signature/status with the gateway
    // For now, accept paymentStatus from request (this should come from gateway verification)
    
    if (paymentStatus === 'paid' || paymentStatus === 'success') {
      // Payment successful
      booking.paymentStatus = 'paid';
      booking.paymentId = paymentId;
      booking.paidAt = new Date();
      await booking.save();

      const populatedBooking = await Booking.findById(booking._id)
        .populate('service', 'title price duration')
        .populate('provider', 'businessName phone')
        .populate('customer', 'name email phone');

      return res.json({
        success: true,
        message: 'Payment verified and completed successfully',
        booking: populatedBooking,
      });
    } else {
      // Payment failed
      booking.paymentStatus = 'failed';
      await booking.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        booking: {
          _id: booking._id,
          paymentStatus: booking.paymentStatus,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// TODO: Add webhook endpoint for payment gateway callbacks
// This should be a separate route without customer authentication
// Example: router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => { ... })

export default router;
