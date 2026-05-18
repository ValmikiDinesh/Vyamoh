'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlineUpload } from 'react-icons/hi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  icon: '🕶️',
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm((prev) => ({ ...prev, name, slug: editCategory ? prev.slug : slug }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('images', file);
    try {
      const { data } = await api.post('/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = data.images?.[0] || data.url;
      setForm((prev) => ({ ...prev, image: url }));
      toast.success('Category image uploaded successfully');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error('Category Name and Slug are required.');
      return;
    }
    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory._id}`, form);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', form);
        toast.success('Category created successfully');
      }
      setShowForm(false);
      setEditCategory(null);
      setForm(emptyForm);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const deactivateCategory = async (id) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deactivated');
      fetchCategories();
    } catch {
      toast.error('Failed to deactivate category');
    }
  };

  const toggleCategoryStatus = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      toast.success(`Category status updated`);
      fetchCategories();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const startEdit = (cat) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || '🕶️',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Category Management</h1>
        <button onClick={() => { setEditCategory(null); setForm(emptyForm); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm bg-black dark:bg-white dark:text-black hover:opacity-90">
          <HiOutlinePlus size={16} /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl my-8 p-8" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xl font-bold mb-6">{editCategory ? 'Edit Category' : 'Create Category'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Category Name *</label>
                  <input placeholder="e.g. Polarized" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Slug *</label>
                  <input placeholder="e.g. polarized" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Emoji Icon</label>
                  <input placeholder="e.g. 🌊" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="input-field" required />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">Description</label>
                <textarea placeholder="Write a short description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" />
              </div>

              {/* Upload controls */}
              <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400 mb-2">Category Card Image</h4>
                
                <div className="flex gap-4 items-center">
                  <label className="flex-1 border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <HiOutlineUpload size={24} className="mb-1 text-neutral-400" />
                    <span className="text-xs font-bold">Upload Category Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {form.image && (
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                      <img src={form.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {uploading && <div className="text-xs text-center text-rose-500 animate-pulse">Uploading to Cloudinary... Please wait</div>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditCategory(null); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary bg-black hover:bg-neutral-900 dark:bg-white dark:text-black flex-1 font-bold text-xs uppercase tracking-wider">{editCategory ? 'Update Category' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Category Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 shimmer" />)}</div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-900 text-neutral-400">
                <th className="p-4 text-left font-medium">Icon</th>
                <th className="p-4 text-left font-medium">Category Details</th>
                <th className="p-4 text-left font-medium">Slug</th>
                <th className="p-4 text-left font-medium">Sort Order</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="p-4 text-2xl">{c.icon || '🕶️'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 rounded overflow-hidden border border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                        <img src={c.image || 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight text-neutral-900 dark:text-white">{c.name}</h4>
                        <p className="text-xs text-neutral-400 truncate max-w-xs">{c.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">{c.slug}</td>
                  <td className="p-4 font-bold">{c.sortOrder}</td>
                  <td className="p-4">
                    <button onClick={() => toggleCategoryStatus(c)} className="btn-ghost p-2" title="Toggle active status">
                      {c.isActive ? <HiOutlineEye size={18} className="text-emerald-500" /> : <HiOutlineEyeOff size={18} className="text-rose-500" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="btn-ghost p-2 text-blue-500"><HiOutlinePencil size={16} /></button>
                      <button onClick={() => deactivateCategory(c._id)} className="btn-ghost p-2 text-rose-500"><HiOutlineTrash size={16} /></button>
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
