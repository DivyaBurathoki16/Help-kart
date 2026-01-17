import { useState } from 'react';
import axios from 'axios';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import { getApiUrl } from '../../config/api';

const BehaviorReportModal = ({ booking, onClose, onSuccess }) => {
    const [issueType, setIssueType] = useState('rude_behavior');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(getApiUrl('api/behavior-reports'), {
                bookingId: booking._id,
                issueType,
                description,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg animate-scaleIn">
                <Card className="p-8 shadow-2xl border-rose-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Report Provider Behavior</h2>
                            <p className="text-sm text-slate-600">
                                Booking: <span className="font-semibold">{booking.service?.title}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                        <p className="text-sm text-rose-800 flex gap-2">
                            <span className="font-bold font-display">⚠️ Important:</span>
                            This report is ONLY for behavioral issues (misconduct, harassment, rudeness). For service quality or damage issues, please use the "Report Issue" flow.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Type of Misconduct
                            </label>
                            <select
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                required
                            >
                                <option value="rude_behavior">Rude Behavior</option>
                                <option value="verbal_abuse">Verbal Abuse</option>
                                <option value="unprofessional_conduct">Unprofessional Conduct</option>
                                <option value="harassment">Harassment</option>
                                <option value="etiquette_violation">Etiquette Violation</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Detailed Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please describe exactly what happened..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100 flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all font-display"
                            >
                                Cancel
                            </button>
                            <PrimaryButton
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 border-none"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default BehaviorReportModal;
