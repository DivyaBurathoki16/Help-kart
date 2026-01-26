import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    phone: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'confirmed',
        'in_progress',
        'provider_completed',
        'completed',
        'issue_reported',
        'redo_required',
        'redo_completed',
        'refund_pending',
        'cancelled',
        'cancelled_by_customer',
        'cancelled_by_provider',
        'cancelled_by_admin',
        'rejected',
        'reschedule_requested',
        'resolved',
      ],
      default: 'pending',
    },
    rescheduleMessage: {
      type: String,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CARD'],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    serviceStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'provider'],
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed'],
      default: 'none',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    providerCompleted: {
      type: Boolean,
      default: false,
    },
    customerCompleted: {
      type: Boolean,
      default: false,
    },
    providerCompletedAt: {
      type: Date,
    },
    autoCompleted: {
      type: Boolean,
      default: false,
    },
    // Proof of Work & Issue Reporting
    proofOfWork: {
      type: [String],
      default: [],
    },
    customerProof: {
      type: [String],
      default: [],
    },
    issueReportedAt: {
      type: Date,
    },
    issueType: {
      type: String,
      enum: ['poor_quality', 'incomplete', 'damage', 'other'],
    },
    issueDescription: {
      type: String,
      trim: true,
    },
    issueWindowExpiresAt: {
      type: Date,
    },
    redoRequired: {
      type: Boolean,
      default: false,
    },
    redoCompleted: {
      type: Boolean,
      default: false,
    },
    redoCompletedAt: {
      type: Date,
    },
    // Admin Resolution (updated to match new flow)
    adminDecision: {
      type: String,
      enum: ['redo', 'partial_refund', 'full_refund', 'resolved', 'none'],
      default: 'none',
    },
    adminDecisionNotes: {
      type: String,
      trim: true,
    },
    issueResolvedAt: {
      type: Date,
    },
    behaviorReported: {
      type: Boolean,
      default: false,
    },
    // Review status
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient conflict checking and queries
bookingSchema.index({ provider: 1, bookingDate: 1, status: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
