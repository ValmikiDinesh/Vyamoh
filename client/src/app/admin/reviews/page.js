'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiStar, HiCheck, HiOutlineUpload, HiOutlineChatAlt2 } from 'react-icons/hi';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import MediaUploader from '@/components/admin/MediaUploader';

const emptyForm = {
  product: '',
  reviewerName: '',
  rating: 5,
  title: '',
  text: '',
  images: [],
  videos: [],
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const ratingQuery = ratingFilter ? `&rating=${ratingFilter}` : '';
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/reviews/admin/all?page=${page}&limit=20${ratingQuery}${searchQuery}`);
      setReviews(data.reviews || []);
      setPagination(data.pagination || {});
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=100&adminView=true');
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products list');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter, search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (rev) => {
    setEditReview(rev);
    setForm({
      product: rev.product?._id || '',
      reviewerName: rev.reviewerName || '',
      rating: rev.rating || 5,
      title: rev.title || '',
      text: rev.text || '',
      images: rev.images || [],
      videos: rev.videos || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product) {
      toast.error('Please select a product');
      return;
    }
    if (!form.text.trim()) {
      toast.error('Please fill in the review details');
      return;
    }

    try {
      if (editReview) {
        await api.put(`/reviews/${editReview._id}`, {
          rating: form.rating,
          title: form.title,
          text: form.text,
          reviewerName: form.reviewerName,
          images: form.images,
          videos: form.videos,
        });
        toast.success('Review updated successfully');
      } else {
        await api.post(`/reviews/product/${form.product}`, {
          rating: form.rating,
          title: form.title,
          text: form.text,
          reviewerName: form.reviewerName,
          images: form.images,
          videos: form.videos,
        });
        toast.success('Fake review created successfully');
      }
      setShowForm(false);
      setEditReview(null);
      setForm(emptyForm);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Reviews & Ratings</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage ratings, delete negative reviews, and create fake reviews for marketing.</p>
        </div>
        <button
          onClick={() => {
            setEditReview(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-5 py-3 font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
        >
          <HiOutlinePlus size={16} /> Add Fake Review
        </button>
      </div>

      {/* Review creation/editing form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>
              {editReview ? 'Edit Review' : 'Create Fake Review'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product selector (Only on creation) */}
              {!editReview && (
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Target Product</label>
                  <select
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="">Select a Sunglasses Model...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Reviewer Name (Fake Name)</label>
                <input
                  type="text"
                  value={form.reviewerName}
                  onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                  placeholder="e.g. Liam K. / Sophia Rodriguez (Leave empty for default)"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* Rating Star selection */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Rating</label>
                <div className="flex gap-1 text-neutral-200 dark:text-neutral-800">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="hover:scale-110 transition-transform"
                    >
                      <HiStar
                        size={24}
                        className={
                          star <= form.rating ? 'text-amber-400 fill-current' : 'fill-current'
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
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Stunning design and perfect polarized lens!"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* Text area */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-400 mb-2">Review Details</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Details of the review rating..."
                  rows={4}
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* Media Uploader Integration */}
              <div className="border border-neutral-100 dark:border-neutral-850 p-4 rounded-xl">
                <span className="block text-xs uppercase font-extrabold text-neutral-400 mb-3">Review Media Attachments</span>
                <MediaUploader
                  images={form.images}
                  videos={form.videos}
                  onImagesChange={(imgs) => setForm({ ...form, images: imgs })}
                  onVideosChange={(vids) => setForm({ ...form, videos: vids })}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditReview(null);
                  }}
                  className="border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white px-5 py-2.5 font-semibold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 font-semibold text-xs uppercase tracking-wider hover:opacity-90"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 p-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reviewer name, title or review text..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-4 py-2.5 text-sm focus:outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-4 py-2.5 text-sm focus:outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Table view list of reviews */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 shimmer bg-neutral-100 dark:bg-neutral-900" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-850 text-neutral-400">
          <HiOutlineChatAlt2 size={36} className="mx-auto mb-3" />
          <p className="text-sm">No reviews found matching the filter options.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-850">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-850 text-xs font-bold text-neutral-400 uppercase">
                <th className="p-4">Product</th>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Content</th>
                <th className="p-4">Media</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-850">
              {reviews.map((rev) => (
                <tr key={rev._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/25">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.product?.thumbnail || '/placeholder.png'}
                        alt=""
                        className="w-10 h-10 object-cover border border-neutral-200 dark:border-neutral-800"
                      />
                      <div>
                        <span className="font-semibold block max-w-[150px] truncate">{rev.product?.name}</span>
                        <span className="text-[10px] text-neutral-400 block uppercase">ID: ...{rev.product?._id?.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-semibold block text-black dark:text-white">
                        {rev.reviewerName || rev.user?.name || 'Customer'}
                      </span>
                      {rev.reviewerName ? (
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Admin Fake</span>
                      ) : (
                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">User Real</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <HiStar
                          key={i}
                          size={14}
                          className={i < rev.rating ? 'fill-current' : 'text-neutral-200 dark:text-neutral-800'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs space-y-1">
                      {rev.title && <h4 className="font-bold text-xs">{rev.title}</h4>}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">{rev.text}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {rev.images?.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} className="w-8 h-8 object-cover rounded" alt="" />
                      ))}
                      {rev.videos?.slice(0, 2).map((vid, i) => (
                        <div key={i} className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-[10px] text-white">
                          📹
                        </div>
                      ))}
                      {((rev.images?.length || 0) + (rev.videos?.length || 0)) === 0 && (
                        <span className="text-xs text-neutral-450">-</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rev)}
                        className="p-2 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white"
                        title="Edit Review"
                      >
                        <HiOutlinePencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="p-2 border border-rose-100 dark:border-rose-950/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                        title="Delete Review"
                      >
                        <HiOutlineTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-bold border border-neutral-250 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs font-bold self-center px-2">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-1.5 text-xs font-bold border border-neutral-250 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
