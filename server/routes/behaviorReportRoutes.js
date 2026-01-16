import express from 'express';
import BehaviorReport from '../models/BehaviorReport.js';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/behavior-reports
// @desc    Submit a behavioral report (CUSTOMER ONLY)
// @access  Private/Customer
router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        const { bookingId, issueType, description } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (booking.behaviorReported) {
            return res.status(400).json({ success: false, message: 'Behavior already reported for this booking' });
        }

        const report = await BehaviorReport.create({
            booking: bookingId,
            customer: req.user._id,
            provider: booking.provider,
            issueType,
            description,
        });

        booking.behaviorReported = true;
        await booking.save();

        // Increment provider's report count
        const provider = await Provider.findById(booking.provider);
        if (provider) {
            provider.reportCount = (provider.reportCount || 0) + 1;
            await provider.save();
        }

        res.status(201).json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/behavior-reports
// @desc    Get all behavioral reports (ADMIN ONLY)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const reports = await BehaviorReport.find()
            .populate('customer', 'name email')
            .populate('provider', 'businessName')
            .populate('booking', 'bookingDate bookingTime')
            .sort({ createdAt: -1 });

        res.json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/behavior-reports/:id/review
// @desc    Review and take action on a report (ADMIN ONLY)
// @access  Private/Admin
router.patch('/:id/review', protect, authorize('admin'), async (req, res) => {
    try {
        const { actionTaken, adminNotes } = req.body;
        const report = await BehaviorReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        report.actionTaken = actionTaken;
        report.adminNotes = adminNotes;
        report.status = 'reviewed';

        if (actionTaken !== 'none') {
            const provider = await Provider.findById(report.provider);
            if (provider) {
                if (actionTaken === 'warning') {
                    provider.warningCount += 1;

                    if (provider.warningCount >= 5) {
                        provider.isBanned = true;
                    } else if (provider.warningCount >= 3) {
                        provider.isSuspended = true;
                        // Suspend for 7 days
                        const suspensionEnd = new Date();
                        suspensionEnd.setDate(suspensionEnd.getDate() + 7);
                        provider.suspensionExpiresAt = suspensionEnd;
                    }
                } else if (actionTaken === 'temporary_suspension') {
                    provider.isSuspended = true;
                    const suspensionEnd = new Date();
                    suspensionEnd.setDate(suspensionEnd.getDate() + 7);
                    provider.suspensionExpiresAt = suspensionEnd;
                } else if (actionTaken === 'permanent_ban') {
                    provider.isBanned = true;
                }
                await provider.save();
            }
            report.status = 'action_taken';
        }

        await report.save();
        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/behavior-reports/my
// @desc    Get reports for the current provider (PROVIDER ONLY)
// @access  Private/Provider
router.get('/my', protect, authorize('provider'), async (req, res) => {
    try {
        const provider = await Provider.findOne({ user: req.user._id });
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider profile not found' });
        }

        const reports = await BehaviorReport.find({
            provider: provider._id,
            status: { $in: ['reviewed', 'action_taken'] } // Only show reviewed reports
        })
            .populate('booking', 'bookingDate bookingTime')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reports,
            reportCount: provider.reportCount || 0,
            warningCount: provider.warningCount || 0,
            isSuspended: provider.isSuspended || false,
            suspensionExpiresAt: provider.suspensionExpiresAt,
            isBanned: provider.isBanned || false
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
