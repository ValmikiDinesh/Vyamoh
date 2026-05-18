'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDownload, HiOutlineEye, HiOutlineFilter } from 'react-icons/hi';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [detailOrder, setDetailOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/orders?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ''}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchOrders();
      setDetailOrder(null);
    } catch (err) { toast.error('Failed to update'); }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('Invoice downloaded');
    } catch { toast.error('Failed to download invoice'); }
  };

  const bulkDownloadInvoices = async () => {
    if (selectedOrders.length === 0) { toast.error('Select orders first'); return; }
    try {
      const res = await api.post('/admin/orders/bulk-invoices', { orderIds: selectedOrders }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const ext = selectedOrders.length > 1 ? 'zip' : 'pdf';
      const a = document.createElement('a'); a.href = url; a.download = `invoices.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      toast.success(`${selectedOrders.length} invoice(s) downloaded`);
    } catch { toast.error('Failed'); }
  };

  const toggleSelect = (id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedOrders(prev => prev.length === orders.length ? [] : orders.map(o => o._id));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Orders</h1>
        <div className="flex gap-2">
          {selectedOrders.length > 0 && (
            <button onClick={bulkDownloadInvoices} className="btn-secondary flex items-center gap-2 text-sm">
              <HiOutlineDownload size={16} /> Download {selectedOrders.length} Invoice(s)
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`}>All</button>
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th className="p-4 text-left"><input type="checkbox" checked={selectedOrders.length === orders.length && orders.length > 0} onChange={toggleAll} /></th>
                <th className="p-4 text-left font-medium">Order</th><th className="p-4 text-left font-medium">Customer</th>
                <th className="p-4 text-left font-medium">Amount</th><th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Date</th><th className="p-4 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="p-4"><input type="checkbox" checked={selectedOrders.includes(o._id)} onChange={() => toggleSelect(o._id)} /></td>
                    <td className="p-4 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{o.orderNumber}</td>
                    <td className="p-4" style={{ color: 'var(--text-secondary)' }}>{o.user?.name || 'N/A'}<br /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.user?.email}</span></td>
                    <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>{formatPrice(o.totalAmount)}</td>
                    <td className="p-4"><span className={getStatusColor(o.status)}>{o.status}</span></td>
                    <td className="p-4" style={{ color: 'var(--text-muted)' }}>{formatDate(o.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button onClick={() => setDetailOrder(o)} className="btn-ghost p-2" style={{ color: '#3b82f6' }} title="View"><HiOutlineEye size={16} /></button>
                        <button onClick={() => downloadInvoice(o._id)} className="btn-ghost p-2" style={{ color: '#10b981' }} title="Invoice"><HiOutlineDownload size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--bg-overlay)' }} onClick={() => setDetailOrder(null)}>
          <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto" style={{ background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Order #{detailOrder.orderNumber}</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Customer</h4>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{detailOrder.shippingAddress?.fullName || detailOrder.user?.name}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{detailOrder.user?.email}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{detailOrder.shippingAddress?.phone}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{detailOrder.shippingAddress?.addressLine1}, {detailOrder.shippingAddress?.city} {detailOrder.shippingAddress?.pincode}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Payment</h4>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatPrice(detailOrder.totalAmount)}</p>
                <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{detailOrder.paymentMethod} · {detailOrder.paymentStatus}</p>
              </div>
            </div>

            {/* Items */}
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Items ({detailOrder.items?.length})</h4>
            <div className="space-y-2 mb-6">
              {detailOrder.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{[item.color, item.frameSize].filter(Boolean).join(' · ')} × {item.quantity}</p>
                  </div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Status Update */}
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button key={s} onClick={() => handleStatusUpdate(detailOrder._id, s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${detailOrder.status === s ? 'btn-primary' : 'btn-secondary'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
