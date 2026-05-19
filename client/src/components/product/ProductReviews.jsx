'use client';
import { useState, useEffect } from 'react';
import { HiStar, HiCheck, HiOutlineTrash, HiOutlinePencil, HiOutlineChatAlt2 } from 'react-icons/hi';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function ProductReviews({ productId, onReviewChanged }) {
  const { user, isAuthenticated, setShowAuthModal } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!isAuthenticated || !user) {
      setCanReview(false);
      return;
    }

    if (user.role === 'admin' || user.role === 'superadmin') {
      setCanReview(true);
      return;
    }

    try {
      const { data } = await api.get('/orders/my-orders?limit=100');
      const orders = data.orders || [];
      const hasBought = orders.some(
        (order) =>
          order.status === 'delivered' &&
          order.items.some((item) => item.product === productId || item.product?._id === productId)
      );
      setCanReview(hasBought);
    } catch {
      setCanReview(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [productId, isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please write a review');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/reviews/product/${productId}`, { rating, title, text });
      toast.success('Review submitted successfully!');
      setTitle('');
      setText('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
      if (onReviewChanged) onReviewChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditTitle(review.title || '');
    setEditText(review.text || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editText.trim()) {
      toast.error('Please write a review');
      return;
    }
    try {
      setEditSubmitting(true);
      await api.put(`/reviews/${editingId}`, { rating: editRating, title: editTitle, text: editText });
      toast.success('Review updated successfully!');
      setEditingId(null);
      fetchReviews();
      if (onReviewChanged) onReviewChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
      if (onReviewChanged) onReviewChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="mt-20 border-t border-neutral-100 dark:border-neutral-900 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Customer Feedback</span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>
            Ratings & Reviews
          </h2>
        </div>
        
        <div>
          {!showForm && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthModal(true);
                } else {
                  setShowForm(true);
                }
              }}
              className="bg-black text-white dark:bg-white dark:text-black font-semibold text-xs uppercase tracking-widest px-6 py-3.5 hover:opacity-90 active:scale-95 transition-all"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900 p-8 mb-12 max-w-2xl">
          <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'Outfit' }}>Share Your Experience</h3>
          
          {!canReview && !isAdmin ? (
            <div className="text-center p-6 border border-amber-200/50 bg-amber-500/5 rounded-lg text-amber-600 dark:text-amber-400 text-xs">
              🔒 <strong>Purchase Required:</strong> Only customers who have purchased and received this model can submit a review.
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="underline text-black dark:text-white font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Stars selection */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Rating</label>
                <div className="flex gap-1 text-neutral-200 dark:text-neutral-800">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <HiStar
                        size={24}
                        className={
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-current'
                            : 'fill-current'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Review Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exceeded expectations!"
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Text area */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Review Details</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell us what you like or dislike about this model..."
                  rows={4}
                  required
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black text-white dark:bg-white dark:text-black font-semibold text-xs uppercase tracking-widest px-6 py-3 hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white font-semibold text-xs uppercase tracking-widest px-6 py-3 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 shimmer bg-neutral-100 dark:bg-neutral-900" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-850 text-neutral-400">
          <HiOutlineChatAlt2 size={32} className="mx-auto mb-3" />
          <p className="text-sm font-light">No reviews yet for this model.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100/60 dark:border-neutral-900/60 p-6"
            >
              {editingId === rev._id ? (
                /* Edit Form Inline */
                <form onSubmit={handleUpdate} className="space-y-4">
                  <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Edit Review</h4>
                  <div>
                    <div className="flex gap-1 text-neutral-200 dark:text-neutral-800">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHoverRating(star)}
                          onMouseLeave={() => setEditHoverRating(Star => 0)}
                          className="transition-transform hover:scale-110"
                        >
                          <HiStar
                            size={20}
                            className={
                              star <= (editHoverRating || editRating)
                                ? 'text-amber-400 fill-current'
                                : 'fill-current'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      required
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editSubmitting}
                      className="bg-black text-white dark:bg-white dark:text-black font-semibold text-[10px] uppercase tracking-widest px-4 py-2 hover:opacity-90 disabled:opacity-50"
                    >
                      {editSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-widest px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Regular Review Display */
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    {/* User and Stars info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-sm uppercase text-neutral-600 dark:text-neutral-300">
                        {rev.user?.avatar ? (
                          <img src={rev.user.avatar} alt={rev.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          rev.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{rev.user?.name || 'Customer'}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                              <HiCheck size={10} /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <HiStar
                                key={idx}
                                size={14}
                                className={
                                  idx < rev.rating
                                    ? 'fill-current'
                                    : 'text-neutral-200 dark:text-neutral-800'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-neutral-400">{formatDate(rev.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin or Author controls */}
                    {(isAdmin || (user && user._id === rev.user?._id)) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(rev)}
                          className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Edit Review"
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                          title="Delete Review"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {rev.title && <h4 className="text-sm font-bold mb-1">{rev.title}</h4>}
                  <p className="text-sm text-neutral-650 dark:text-neutral-350 leading-relaxed font-light">
                    {rev.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
