import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/chat/conversations
// @desc    Create or get existing conversation (INQUIRY or BOOKING)
// @access  Private
router.post('/conversations', protect, async (req, res) => {
  try {
    const { type, serviceId, bookingId } = req.body;
    const userId = req.user._id;

    // Validate type
    if (!['INQUIRY', 'BOOKING'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation type. Must be INQUIRY or BOOKING',
      });
    }

    // Validate required fields based on type
    if (type === 'INQUIRY' && !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'serviceId is required for INQUIRY conversations',
      });
    }

    if (type === 'BOOKING' && !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required for BOOKING conversations',
      });
    }

    // Get service/provider info based on type
    let service, provider, providerId, clientId;

    if (type === 'INQUIRY') {
      service = await Service.findById(serviceId).populate('provider');
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // For INQUIRY: client is the requester, provider is from service
      if (req.user.role === 'customer') {
        clientId = userId;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Only customers can create INQUIRY conversations',
        });
      }

      provider = service.provider;
      providerId = provider._id;
    } else {
      // BOOKING type
      const booking = await Booking.findById(bookingId)
        .populate('service')
        .populate('provider')
        .populate('customer');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      // Verify user has access to this booking
      if (req.user.role === 'customer') {
        if (booking.customer._id.toString() !== userId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this booking',
          });
        }
        clientId = userId;
      } else if (req.user.role === 'provider') {
        // Provider can access if it's their booking
        const providerDoc = await Provider.findOne({ user: userId });
        if (!providerDoc || booking.provider._id.toString() !== providerDoc._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this booking',
          });
        }
        clientId = booking.customer._id;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid role for booking conversation',
        });
      }

      service = booking.service;
      provider = booking.provider;
      providerId = provider._id;
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      type,
      ...(type === 'INQUIRY' ? { serviceId } : { bookingId }),
      clientId,
      providerId,
      status: { $ne: 'closed' },
    });

    if (existingConversation) {
      // Return existing conversation with messages
      const messages = await Message.find({ conversationId: existingConversation._id })
        .populate('senderId', 'name avatar')
        .sort({ timestamp: 1 });

      return res.json({
        success: true,
        conversation: existingConversation,
        messages,
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      type,
      ...(type === 'INQUIRY' ? { serviceId } : { bookingId }),
      clientId,
      providerId,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      conversation,
      messages: [],
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query; // Optional filter by type

    let conversations;

    if (req.user.role === 'customer') {
      // Customer sees their conversations
      conversations = await Conversation.find({
        clientId: userId,
        ...(type && { type }),
        status: { $ne: 'closed' },
      })
        .populate('serviceId', 'title primaryImage')
        .populate({
          path: 'bookingId',
          select: 'status bookingDate bookingTime service',
          populate: { path: 'service', select: 'title' }
        })
        .populate('providerId', 'businessName')
        .sort({ lastMessageAt: -1 });
    } else if (req.user.role === 'provider') {
      // Provider sees conversations for their services/bookings
      const provider = await Provider.findOne({ user: userId });
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider profile not found',
        });
      }

      conversations = await Conversation.find({
        providerId: provider._id,
        ...(type && { type }),
        status: { $ne: 'closed' },
      })
        .populate('serviceId', 'title primaryImage')
        .populate({
          path: 'bookingId',
          select: 'status bookingDate bookingTime service',
          populate: { path: 'service', select: 'title' }
        })
        .populate('clientId', 'name avatar')
        .sort({ lastMessageAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Get unread message counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          read: false,
          messageType: 'USER',
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUnread,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/chat/conversations/:id
// @desc    Get single conversation with messages
// @access  Private
router.get('/conversations/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id)
      .populate('serviceId', 'title primaryImage')
      .populate({
        path: 'bookingId',
        select: 'status bookingDate bookingTime service',
        populate: { path: 'service', select: 'title' }
      })
      .populate('clientId', 'name avatar')
      .populate('providerId', 'businessName');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify access
    if (req.user.role === 'customer') {
      if (conversation.clientId._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: userId });
      if (!provider || conversation.providerId._id.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Get messages (both user and system messages)
    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'name avatar')
      .sort({ timestamp: 1 });

    // Mark user messages as read for the current user
    await Message.updateMany(
      {
        conversationId: id,
        senderId: { $ne: userId },
        messageType: 'USER',
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/chat/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check if conversation is locked
    if (conversation.status === 'closed' || conversation.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'This conversation is no longer active',
      });
    }

    // Verify access
    if (req.user.role === 'customer') {
      if (conversation.clientId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: userId });
      if (!provider || conversation.providerId.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const messageTimestamp = new Date();

    // Create message
    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      text: text.trim(),
      messageType: 'USER',
      timestamp: messageTimestamp,
      delivered: true,
      deliveredAt: messageTimestamp,
    });

    // Update conversation's lastMessageAt and lastMessage
    conversation.lastMessageAt = messageTimestamp;
    conversation.lastMessage = {
      text: text.trim().substring(0, 100), // Store first 100 chars
      senderId: userId,
      timestamp: messageTimestamp,
    };
    await conversation.save();

    // Populate sender info
    await message.populate('senderId', 'name avatar');

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/chat/conversations/:id/system-message
// @desc    Add a system message to a conversation (internal use)
// @access  Private (Admin only or internal)
router.post('/conversations/:id/system-message', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, systemEvent } = req.body;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Create system message
    const message = await Message.create({
      conversationId: id,
      text: text,
      messageType: 'SYSTEM',
      systemEvent: systemEvent,
      timestamp: new Date(),
      read: true, // System messages are always "read"
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error creating system message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   PATCH /api/chat/conversations/:id/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.patch('/conversations/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify access
    if (req.user.role === 'customer') {
      if (conversation.clientId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ user: userId });
      if (!provider || conversation.providerId.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: id,
        senderId: { $ne: userId },
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

export default router;
