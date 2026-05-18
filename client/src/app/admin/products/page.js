'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSparkles, HiOutlineEye, HiOutlineEyeOff, HiOutlineUpload } from 'react-icons/hi';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import MediaUploader from '@/components/admin/MediaUploader';
import VariantManager from '@/components/admin/VariantManager';

const emptyForm = {
  name: '',
  brand: 'Vyamoh',
  description: '',
  price: '',
  salePrice: '',
  compareAtPrice: '',
  sku: '',
  stockQuantity: '',
  category: '',
  subcategory: '',
  tags: '',
  isPolarized: false,
  specifications: {
    frameMaterial: 'Acetate',
    lensMaterial: 'Polycarbonate',
    frameSize: 'Medium',
    lensColor: 'Black',
    frameColor: 'Matte Black',
    frameShape: 'wayfarer',
    gender: 'unisex',
    uvProtection: 'UV400',
    weight: 28,
    lensTechnology: 'Polarized TAC, Anti-Glare Coating'
  },
  isFeatured: false,
  isNewArrival: false,
  isBestseller: false,
  images: [],
  videos: [],
  variants: []
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=100&adminView=true');
      setProducts(data.products || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch {}
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Math.round(parseFloat(form.price) * 100),
      salePrice: form.salePrice ? Math.round(parseFloat(form.salePrice) * 100) : undefined,
      compareAtPrice: form.compareAtPrice ? Math.round(parseFloat(form.compareAtPrice) * 100) : undefined,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
      variants: form.variants.map(v => ({ ...v, price: v.price ? Math.round(parseFloat(v.price) * 100) : 0 })),
    };
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setShowForm(false); setEditProduct(null); setForm(emptyForm); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deactivated'); fetchProducts(); } catch { toast.error('Failed'); }
  };

  const toggleProduct = async (id) => {
    try { const { data } = await api.patch(`/products/${id}/toggle`); toast.success(data.message); fetchProducts(); } catch { toast.error('Failed'); }
  };

  const generateAI = async (id) => {
    try { const { data } = await api.post(`/products/${id}/ai-content`); toast.success(`Content generated (${data.content.source})`); fetchProducts(); } catch { toast.error('AI generation failed'); }
  };

  const startEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      brand: p.brand,
      description: p.description,
      price: (p.price / 100).toString(),
      salePrice: p.salePrice ? (p.salePrice / 100).toString() : '',
      compareAtPrice: p.compareAtPrice ? (p.compareAtPrice / 100).toString() : '',
      sku: p.sku || '',
      stockQuantity: (p.stockQuantity || p.totalStock || 0).toString(),
      category: p.category?._id || p.category || '',
      subcategory: p.subcategory || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      isPolarized: p.isPolarized || false,
      specifications: {
        frameMaterial: p.specifications?.frameMaterial || 'Acetate',
        lensMaterial: p.specifications?.lensMaterial || 'Polycarbonate',
        frameSize: p.specifications?.frameSize || 'Medium',
        lensColor: p.specifications?.lensColor || 'Black',
        frameColor: p.specifications?.frameColor || 'Matte Black',
        frameShape: p.specifications?.frameShape || 'wayfarer',
        gender: p.specifications?.gender || 'unisex',
        uvProtection: p.specifications?.uvProtection || 'UV400',
        weight: p.specifications?.weight || 28,
        lensTechnology: p.specifications?.lensTechnology || 'Polarized TAC, Anti-Glare Coating'
      },
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestseller: p.isBestseller,
      images: p.images || [],
      videos: p.videos || [],
      variants: (p.variants || []).map(v => ({ ...v, price: v.price ? (v.price / 100).toString() : '' })),
    });
    setShowForm(true);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/products/bulk-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${data.results.created} products created, ${data.results.failed} failed`);
      fetchProducts();
    } catch (err) { toast.error('Bulk upload failed'); }
    e.target.value = '';
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Products</h1>
        <div className="flex gap-2 flex-wrap">
          <label className="btn-secondary flex items-center gap-2 cursor-pointer text-sm">
            <HiOutlineUpload size={16} /> Bulk Upload
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} className="hidden" />
          </label>
          <button onClick={() => { setEditProduct(null); setForm(emptyForm); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <HiOutlinePlus size={16} /> Add Sunglasses
          </button>
        </div>
      </div>

      {/* Search */}
      <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field mb-6 max-w-md" />

      {/* Product Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'var(--bg-overlay)' }}>
          <div className="glass-card w-full max-w-3xl my-8" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{editProduct ? 'Edit Sunglasses' : 'New Sunglasses'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Sunglasses Model Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" required />
              </div>
              <textarea placeholder="Product Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[100px]" required />

              {/* Pricing */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="number" step="0.01" placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
                <input type="number" step="0.01" placeholder="Sale Price (₹)" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input-field" />
                <input type="number" step="0.01" placeholder="MRP (₹)" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="input-field" />
                <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field" />
              </div>

              {/* Stock & Category */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input type="number" placeholder="Stock Quantity" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="input-field" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required>
                  <option value="">Select Category *</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={form.specifications.gender} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, gender: e.target.value } })} className="input-field">
                  {['men', 'women', 'unisex'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Optical Specifications */}
              <div className="border border-neutral-100 dark:border-neutral-900 p-4 rounded-xl space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400">Optical & Frame Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <select value={form.specifications.frameShape} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, frameShape: e.target.value } })} className="input-field">
                    {['aviator', 'wayfarer', 'round', 'square', 'cat-eye', 'rectangle', 'oval', 'sport', 'oversized', 'clubmaster'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={form.specifications.frameMaterial} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, frameMaterial: e.target.value } })} className="input-field">
                    {['Acetate', 'Titanium', 'Metal', 'Polycarbonate', 'Mixed'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={form.specifications.lensMaterial} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, lensMaterial: e.target.value } })} className="input-field">
                    {['Glass', 'Polycarbonate', 'CR-39', 'Nylon'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input placeholder="Frame Size (e.g. Medium)" value={form.specifications.frameSize} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, frameSize: e.target.value } })} className="input-field" />
                  <input placeholder="Lens Color" value={form.specifications.lensColor} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, lensColor: e.target.value } })} className="input-field" />
                  <input placeholder="Frame Color" value={form.specifications.frameColor} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, frameColor: e.target.value } })} className="input-field" />
                  <input type="number" placeholder="Weight (grams)" value={form.specifications.weight} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, weight: parseFloat(e.target.value) || 28 } })} className="input-field" />
                  <input placeholder="UV Protection (e.g. UV400)" value={form.specifications.uvProtection} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, uvProtection: e.target.value } })} className="input-field" />
                  <input placeholder="Lens Tech details" value={form.specifications.lensTechnology} onChange={(e) => setForm({ ...form, specifications: { ...form.specifications, lensTechnology: e.target.value } })} className="input-field" />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={form.isPolarized} onChange={(e) => setForm({ ...form, isPolarized: e.target.checked })} style={{ accentColor: 'var(--brand-500)' }} /> Is Polarized?
                  </label>
                </div>
              </div>

              {/* Tags */}
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" />

              {/* Flags */}
              <div className="flex gap-6 flex-wrap">
                {[['isFeatured', 'Featured'], ['isNewArrival', 'New Arrival'], ['isBestseller', 'Bestseller']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} style={{ accentColor: 'var(--brand-500)' }} /> {label}
                  </label>
                ))}
              </div>

              {/* Media Upload */}
              <MediaUploader images={form.images} videos={form.videos}
                onImagesChange={(imgs) => setForm({ ...form, images: imgs, thumbnail: imgs[0] || '' })}
                onVideosChange={(vids) => setForm({ ...form, videos: vids })} />

              {/* Variants */}
              <VariantManager variants={form.variants} onChange={(v) => setForm({ ...form, variants: v })} />

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editProduct ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="p-4 text-left font-medium">Product</th><th className="p-4 text-left font-medium">Price</th><th className="p-4 text-left font-medium">Stock</th><th className="p-4 text-left font-medium">Polarized</th><th className="p-4 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-900">
                          {p.thumbnail || p.images?.[0] ? <img src={p.thumbnail || p.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-lg">🕶️</span>}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.brand} · {p.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{formatPrice(p.salePrice || p.price)}</span>
                      {p.compareAtPrice > (p.salePrice || p.price) && <span className="line-through text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{formatPrice(p.compareAtPrice)}</span>}
                    </td>
                    <td className="p-4"><span className="font-medium" style={{ color: p.totalStock > 10 ? '#10b981' : p.totalStock > 0 ? '#f59e0b' : '#ef4444' }}>{p.totalStock}</span></td>
                    <td className="p-4">
                      {p.isPolarized ? (
                        <span className="text-[10px] uppercase font-bold tracking-wide text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">Yes</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wide text-neutral-400 bg-neutral-50 dark:bg-neutral-850 px-2 py-0.5 rounded">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => toggleProduct(p._id)} className="btn-ghost p-2" title="Toggle Enable" style={{ color: p.isEnabled !== false ? '#10b981' : '#ef4444' }}>
                          {p.isEnabled !== false ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}
                        </button>
                        <button onClick={() => generateAI(p._id)} className="btn-ghost p-2" title="AI Content" style={{ color: '#a855f7' }}><HiOutlineSparkles size={16} /></button>
                        <button onClick={() => startEdit(p)} className="btn-ghost p-2" title="Edit" style={{ color: '#3b82f6' }}><HiOutlinePencil size={16} /></button>
                        <button onClick={() => deleteProduct(p._id)} className="btn-ghost p-2" title="Delete" style={{ color: '#ef4444' }}><HiOutlineTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
