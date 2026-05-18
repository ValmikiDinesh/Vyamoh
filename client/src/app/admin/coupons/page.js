'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: 1, validFrom: '', validUntil: '', newCustomersOnly: false });

  const fetchCoupons = async () => {
    try { const { data } = await api.get('/coupons'); setCoupons(data.coupons || []); } catch {}
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      value: form.type === 'percentage' ? parseFloat(form.value) : Math.round(parseFloat(form.value) * 100),
      minOrderAmount: form.minOrderAmount ? Math.round(parseFloat(form.minOrderAmount) * 100) : 0,
      maxDiscount: form.maxDiscount ? Math.round(parseFloat(form.maxDiscount) * 100) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
    };
    try {
      if (editCoupon) { await api.put(`/coupons/${editCoupon._id}`, payload); toast.success('Coupon updated'); }
      else { await api.post('/coupons', payload); toast.success('Coupon created'); }
      setShowForm(false); setEditCoupon(null); fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetchCoupons(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Coupons</h1>
        <button onClick={() => { setEditCoupon(null); setForm({ code: '', description: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: 1, validFrom: '', validUntil: '', newCustomersOnly: false }); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"><HiOutlinePlus size={18} /> Add Coupon</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-semibold text-xl mb-6">{editCoupon ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Code (e.g. SAVE20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" required />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="free_shipping">Free Shipping</option>
                </select>
                <input type="number" placeholder={form.type === 'percentage' ? 'Value (%)' : 'Value (₹)'} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Min Order (₹)" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input-field" />
                <input type="number" placeholder="Max Discount (₹)" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-dark-400 text-xs mb-1 block">Valid From</label><input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="input-field" required /></div>
                <div><label className="text-dark-400 text-xs mb-1 block">Valid Until</label><input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="input-field" required /></div>
              </div>
              <input type="number" placeholder="Usage Limit (empty = unlimited)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-field" />
              <label className="flex items-center gap-2 text-dark-300 text-sm"><input type="checkbox" checked={form.newCustomersOnly} onChange={(e) => setForm({ ...form, newCustomersOnly: e.target.checked })} className="accent-brand-500" /> New customers only</label>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editCoupon ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-dark-400 text-left border-b border-white/5">
              <th className="p-4 font-medium">Code</th><th className="p-4 font-medium">Type</th><th className="p-4 font-medium">Value</th><th className="p-4 font-medium">Usage</th><th className="p-4 font-medium">Valid Until</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 text-white font-mono font-bold">{c.code}</td>
                  <td className="p-4 capitalize text-dark-300">{c.type.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-white">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? formatPrice(c.value) : '—'}</td>
                  <td className="p-4 text-dark-300">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : '/∞'}</td>
                  <td className="p-4 text-dark-400">{formatDate(c.validUntil)}</td>
                  <td className="p-4"><span className={c.isActive && new Date(c.validUntil) > new Date() ? 'badge-success' : 'badge-danger'}>{c.isActive && new Date(c.validUntil) > new Date() ? 'Active' : 'Expired'}</span></td>
                  <td className="p-4 flex gap-1">
                    <button onClick={() => { setEditCoupon(c); setForm({ ...c, value: c.type === 'percentage' ? c.value : c.value / 100, minOrderAmount: c.minOrderAmount / 100, maxDiscount: c.maxDiscount ? c.maxDiscount / 100 : '', usageLimit: c.usageLimit || '', validFrom: c.validFrom?.slice(0, 10), validUntil: c.validUntil?.slice(0, 10) }); setShowForm(true); }} className="btn-ghost p-2 text-blue-400"><HiOutlinePencil size={16} /></button>
                    <button onClick={() => deleteCoupon(c._id)} className="btn-ghost p-2 text-red-400"><HiOutlineTrash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
