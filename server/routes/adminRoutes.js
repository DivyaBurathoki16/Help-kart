import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Contact from '../models/Contact.js';
import PageContent from '../models/PageContent.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendReplyToUser } from '../utils/emailService.js';

const router = express.Router();

// @route   GET /api/admin/issues
// @desc    Get all reported issues (ADMIN ONLY)
// @access  Private/Admin
router.get('/issues', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    // Get all bookings with reported issues or relevant statuses
    const bookings = await Booking.find({
      status: { $in: ['issue_reported', 'redo_required', 'redo_completed', 'refund_pending', 'completed', 'resolved', 'cancelled_by_admin'] },
      $or: [{ issueReportedAt: { $exists: true } }, { status: 'issue_reported' }]
    })
      .populate('service', 'title price duration')
      .populate('provider', 'businessName phone email')
      .populate('customer', 'name email phone')
      .sort({ issueReportedAt: -1 }); // Most recent issues first

    res.json({
      success: true,
      issues: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching admin issues:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/admin/issues/:id/resolve
// @desc    Admin resolves an issue - decides on redo, refund, or dismissal (ADMIN ONLY)
// @access  Private/Admin
router.patch('/issues/:id/resolve', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { decision, notes, refundAmount } = req.body;

    // Validation
    const validDecisions = ['redo', 'partial_refund', 'full_refund', 'resolved'];
    if (!decision || !validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid decision. Must be "redo", "partial_refund", "full_refund", or "resolved"',
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking has an issue reported or is in a state that can be resolved
    if (booking.status !== 'issue_reported' && booking.status !== 'redo_completed') {
      // Allow resolving if it was redo_completed as well? 
      // STRICTLY: usually only resolve active issues.
      // But let's check if we want to allow re-resolving. For now, strict check.
      if (booking.status !== 'issue_reported') {
        return res.status(400).json({
          success: false,
          message: `Booking is not in issue_reported status. Current status: ${booking.status}`,
        });
      }
    }

    const now = new Date();
    booking.adminDecision = decision;
    booking.adminDecisionNotes = notes;
    booking.resolvedAt = now;

    if (decision === 'redo') {
      // Require provider to redo the service
      booking.status = 'redo_required'; // or 'in_progress' depending on flow. Let's use 'in_progress' to allow provider to complete again? 
      // actually if we use 'in_progress', provider can mark complete again.
      // Let's stick to the flow 'redo_required' -> Provider acts?
      // For simplicity/existing flow compatibility:
      // If we set to 'in_progress', provider sees it.
      // But we previously saw 'redo_required' in the file.
      // Let's use 'in_progress' to reuse the completion flow, but maybe reset specific flags?
      booking.status = 'in_progress';
      booking.providerCompleted = false;
      // booking.proofOfWork = []; // Keep old proof? Or clear? Better keep for history.
    } else if (decision === 'partial_refund') {
      // Process partial refund
      if (!refundAmount || refundAmount <= 0 || refundAmount > booking.totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Invalid refund amount. Must be between 0 and total booking amount.',
        });
      }
      booking.status = 'resolved'; // Final state? Or 'refund_pending'?
      booking.paymentStatus = 'refunded'; // Simplification
      booking.refundAmount = refundAmount;
      // In real app, trigger refund mechanism
    } else if (decision === 'full_refund') {
      // Process full refund
      booking.status = 'cancelled_by_admin'; // or 'resolved'
      booking.paymentStatus = 'refunded';
      booking.refundAmount = booking.totalAmount;
    } else if (decision === 'resolved') {
      // Admin dismisses the issue, marks as completed (Customer claim rejected)
      booking.status = 'completed';
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title price duration')
      .populate('provider', 'businessName phone email')
      .populate('customer', 'name email phone');

    res.json({
      success: true,
      booking: populatedBooking,
      message: `Issue resolved with decision: ${decision}`,
    });
  } catch (error) {
    console.error('Error resolving issue:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/messages
// @desc    Get all contact messages (ADMIN ONLY)
// @access  Private/Admin
router.get('/messages', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const messages = await Contact.find()
      .sort({ createdAt: -1 }) // Most recent first
      .select('-__v');

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages',
    });
  }
});

// @route   POST /api/admin/messages/:id/reply
// @desc    Reply to a contact message (ADMIN ONLY)
// @access  Private/Admin
router.post('/messages/:id/reply', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both subject and message',
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    // Send reply email
    try {
      await sendReplyToUser(contact.email, subject, message);
      
      // Mark message as read
      contact.isRead = true;
      await contact.save();

      res.json({
        success: true,
        message: 'Reply sent successfully',
      });
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send reply email. Please try again.',
      });
    }
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reply',
    });
  }
});

// @route   DELETE /api/admin/messages/:id
// @desc    Delete a contact message (ADMIN ONLY)
// @access  Private/Admin
router.delete('/messages/:id', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete message',
    });
  }
});

// @route   PATCH /api/admin/messages/:id/read
// @desc    Mark message as read/unread (ADMIN ONLY)
// @access  Private/Admin
router.patch('/messages/:id/read', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { isRead } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    contact.isRead = isRead !== undefined ? isRead : !contact.isRead;
    await contact.save();

    res.json({
      success: true,
      message: contact.isRead ? 'Message marked as read' : 'Message marked as unread',
      contact,
    });
  } catch (error) {
    console.error('Error updating message read status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update message status',
    });
  }
});

// Page content management (Admin CMS)

// @route   PUT /api/admin/pages/:slug
// @desc    Create or update dynamic page content (ADMIN ONLY)
// @access  Private/Admin
router.put('/pages/:slug', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Expected an object in "data" field.',
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please configure MONGODB_URI in your .env file.',
      });
    }

    const page = await PageContent.findOneAndUpdate(
      { slug },
      { data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      page,
      message: 'Page content saved to database successfully',
    });
  } catch (error) {
    console.error('Error updating page content:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update page content',
    });
  }
});

export default router;
