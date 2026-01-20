import mongoose from 'mongoose';

const behaviorReportSchema = mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
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
        issueType: {
            type: String,
            enum: [
                'rude_behavior',
                'verbal_abuse',
                'unprofessional_conduct',
                'harassment',
                'etiquette_violation',
            ],
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        adminNotes: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'action_taken'],
            default: 'pending',
        },
        actionTaken: {
            type: String,
            enum: ['none', 'warning', 'temporary_suspension', 'permanent_ban'],
            default: 'none',
        },
    },
    {
        timestamps: true,
    }
);

const BehaviorReport = mongoose.model('BehaviorReport', behaviorReportSchema);

export default BehaviorReport;
