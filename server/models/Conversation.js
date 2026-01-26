import mongoose from 'mongoose';

const conversationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['INQUIRY', 'BOOKING'],
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: function() {
        return this.type === 'INQUIRY';
      },
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: function() {
        return this.type === 'BOOKING';
      },
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessage: {
      text: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
conversationSchema.index({ clientId: 1, status: 1 });
conversationSchema.index({ providerId: 1, status: 1 });
conversationSchema.index({ serviceId: 1, type: 1 });
conversationSchema.index({ bookingId: 1, type: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
