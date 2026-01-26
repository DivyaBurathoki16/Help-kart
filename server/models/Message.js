import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return this.messageType !== 'SYSTEM';
      },
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['USER', 'SYSTEM'],
      default: 'USER',
    },
    systemEvent: {
      type: String,
      enum: [
        'INQUIRY_STARTED',
        'BOOKING_CREATED',
        'BOOKING_ACCEPTED',
        'BOOKING_REJECTED',
        'BOOKING_CANCELLED',
        'SERVICE_COMPLETED',
        'CONVERSATION_CLOSED',
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    delivered: {
      type: Boolean,
      default: true,
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, timestamp: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ read: 1 });
messageSchema.index({ messageType: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
