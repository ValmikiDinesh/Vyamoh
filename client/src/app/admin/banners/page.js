'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineUpload } from 'react-icons/hi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '',
  subtitle: '',
  desktopImage: '',
  mobileImage: '',
  video: '',
  ctaText: 'Shop Now',
  ctaLink: '/products',
  isActive: true,
  startDate: '',
  endDate: '',
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banners/admin');
      setBanners(data.banners || []);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    if (type === 'video') {
      formData.append('videos', file);
    } else {
      formData.append('images', file);
    }
    const endpoint = type === 'video' ? '/products/upload-videos' : '/products/upload-images';
    try {
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = type === 'video' ? (data.videos?.[0]?.url || data.url) : (data.images?.[0] || data.url);
      setForm((prev) => ({ ...prev, [type]: url }));
      toast.success(`${type} uploaded successfully`);
    } catch {
      toast.error('Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.desktopImage || !form.mobileImage) {
      toast.error('Both desktop and mobile images are required.');
      return;
    }
    try {
      if (editBanner) {
        await api.put(`/banners/${editBanner._id}`, form);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created successfully');
      }
      setShowForm(false);
      setEditBanner(null);
      setForm(emptyForm);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const toggleBannerStatus = async (b) => {
    try {
      await api.put(`/banners/${b._id}`, { isActive: !b.isActive });
      toast.success(`Banner status updated`);
      fetchBanners();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const startEdit = (b) => {
    setEditBanner(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage,
      video: b.video || '',
      ctaText: b.ctaText || 'Shop Now',
      ctaLink: b.ctaLink || '/products',
      isActive: b.isActive,
      startDate: b.startDate ? new Date(b.startDate).toISOString().slice(0, 16) : '',
      endDate: b.endDate ? new Date(b.endDate).toISOString().slice(0, 16) : '',
    });
    setShowForm(true);
  };

  // Reordering controls
  const handleMove = async (index, direction) => {
    const newBanners = [...banners];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    // Swap elements
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);
    try {
      const ids = newBanners.map(b => b._id);
      await api.put('/banners/reorder', { bannerIds: ids });
      toast.success('Banner order updated');
    } catch {
      toast.error('Failed to save updated order');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Banner Management</h1>
        <button onClick={() => { setEditBanner(null); setForm(emptyForm); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm bg-black dark:bg-white dark:text-black hover:opacity-90">
          <HiOutlinePlus size={16} /> Add Slide Banner
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl my-8 p-8" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xl font-bold mb-6">{editBanner ? 'Edit Slide Banner' : 'Create Slide Banner'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Heading *</label>
                  <input placeholder="e.g. Polarized Excellence" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Subheading</label>
                  <input placeholder="e.g. Designed for absolute clarity" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">CTA Text</label>
                  <input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">CTA Link</label>
                  <input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="input-field" required />
                </div>
              </div>

              {/* Scheduling dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Start Date (Optional)</label>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">End Date (Optional)</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" />
                </div>
              </div>

              {/* Upload controls */}
              <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400 mb-2">Media Uploads</h4>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <label className="border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <HiOutlineUpload size={20} className="mb-1 text-neutral-400" />
                    <span className="text-[10px] font-bold">Desktop Img *</span>
                    <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'desktopImage')} className="hidden" />
                  </label>

                  <label className="border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <HiOutlineUpload size={20} className="mb-1 text-neutral-400" />
                    <span className="text-[10px] font-bold">Mobile Img *</span>
                    <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'mobileImage')} className="hidden" />
                  </label>

                  <label className="border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <HiOutlineUpload size={20} className="mb-1 text-neutral-400" />
                    <span className="text-[10px] font-bold">Video (Opt)</span>
                    <input type="file" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} className="hidden" />
                  </label>
                </div>
                {uploading && <div className="text-xs text-center text-rose-500 animate-pulse">Uploading to Cloudinary... Please wait</div>}
              </div>

              {/* Live Preview Pane */}
              {(form.desktopImage || form.video) && (
                <div className="rounded-xl border border-neutral-100 dark:border-neutral-900 overflow-hidden relative aspect-video">
                  <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5">Live Preview</div>
                  {form.video ? (
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                      <source src={form.video} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={form.desktopImage} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8 text-white">
                    <h3 className="text-lg font-bold">{form.title || 'Slide Title'}</h3>
                    <p className="text-[11px] text-neutral-300 max-w-sm mt-1">{form.subtitle || 'Subtitle descriptive'}</p>
                    <span className="inline-block mt-3 bg-white text-black text-[9px] font-bold uppercase tracking-wider px-4 py-1.5 self-start">{form.ctaText}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditBanner(null); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary bg-black hover:bg-neutral-900 dark:bg-white dark:text-black flex-1 font-bold text-xs uppercase tracking-wider">{editBanner ? 'Update Banner' : 'Publish Banner'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Banner Sequence Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 shimmer" />)}</div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-900 text-neutral-400">
                <th className="p-4 text-left font-medium">Order</th>
                <th className="p-4 text-left font-medium">Slide Details</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Scheduled</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b, idx) => (
                <tr key={b._id} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-center justify-center w-8">
                      <button onClick={() => handleMove(idx, -1)} disabled={idx === 0} className="btn-ghost p-1 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-30">
                        <HiOutlineChevronUp size={16} />
                      </button>
                      <span className="font-bold text-xs">{idx + 1}</span>
                      <button onClick={() => handleMove(idx, 1)} disabled={idx === banners.length - 1} className="btn-ghost p-1 text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-30">
                        <HiOutlineChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-neutral-100 dark:bg-neutral-900 rounded overflow-hidden flex-shrink-0">
                        <img src={b.desktopImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight text-neutral-900 dark:text-white">{b.title}</h4>
                        <p className="text-xs text-neutral-400">{b.subtitle || 'No subtitle'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleBannerStatus(b)} className="btn-ghost p-2" title="Toggle active status">
                      {b.isActive ? <HiOutlineEye size={18} className="text-emerald-500" /> : <HiOutlineEyeOff size={18} className="text-rose-500" />}
                    </button>
                  </td>
                  <td className="p-4 text-xs text-neutral-400">
                    {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Immediate'}
                    {b.endDate ? ` to ${new Date(b.endDate).toLocaleDateString()}` : ' onwards'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(b)} className="btn-ghost p-2 text-blue-500"><HiOutlinePencil size={16} /></button>
                      <button onClick={() => deleteBanner(b._id)} className="btn-ghost p-2 text-rose-500"><HiOutlineTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
