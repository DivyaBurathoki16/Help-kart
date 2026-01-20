import { useState } from 'react';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import { getApiUrl } from '../../config/api';
import axios from 'axios';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(getApiUrl('api/reviews'), {
        bookingId: booking._id,
        rating,
        comment: comment.trim(),
      });

      alert(response.data.message || 'Review submitted successfully.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-lg w-full my-8 dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Rate Your Service</h2>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mt-1">
                Share your experience for <span className="font-semibold">{booking.service?.title || 'this service'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Rating selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-3">
              Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  disabled={submitting}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                    star <= rating
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-neutral-700 text-slate-500 dark:text-neutral-300 border-slate-200 dark:border-neutral-600 hover:border-amber-400'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
              Comment (optional)
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share a few details about your experience..."
              disabled={submitting}
              className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400 transition-all duration-300 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={submitting || !rating}
              className="flex-1"
              icon={
                submitting ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              }
              iconPosition="left"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewModal;

