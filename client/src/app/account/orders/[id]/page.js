'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineTruck, HiOutlineLocationMarker } from 'react-icons/hi';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!confirm('Cancel this order?')) return;
    try {
      const { data } = await api.post(`/orders/${id}/cancel`, { reason: 'Changed my mind' });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-64 shimmer rounded-2xl" /></div>;
  if (!order) return <div className="text-center py-20 text-dark-400">Order not found</div>;

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{order.orderNumber}</h1>
          <p className="text-dark-400 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`${getStatusColor(order.status)} text-sm px-4 py-1.5`}>{order.status.replace(/_/g, ' ').toUpperCase()}</span>
      </div>

      {/* Status tracker */}
      {!['cancelled', 'returned', 'refunded'].includes(order.status) && (
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-700" />
            <div className="absolute top-5 left-0 h-0.5 bg-brand-500 transition-all" style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? 'bg-brand-500 text-white' : 'bg-dark-700 text-dark-400'}`}>
                  {i < currentStep ? <HiOutlineCheck size={18} /> : i + 1}
                </div>
                <span className="text-[10px] text-dark-400 mt-2 capitalize whitespace-nowrap">{step.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="glass-card">
          <h3 className="text-white font-semibold mb-4">Items ({order.items.length})</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-dark-400 text-xs">{item.color ? `${item.color} · ` : ''}Qty: {item.quantity}</p>
                </div>
                <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-dark-400">Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-dark-400">Shipping</span><span className="text-white">{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span></div>
            {order.couponDiscount > 0 && <div className="flex justify-between"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-{formatPrice(order.couponDiscount)}</span></div>}
            <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2"><span className="text-white">Total</span><span className="text-white">{formatPrice(order.totalAmount)}</span></div>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><HiOutlineLocationMarker /> Delivery Address</h3>
            <p className="text-white text-sm">{order.shippingAddress.fullName}</p>
            <p className="text-dark-300 text-sm">{order.shippingAddress.addressLine1}</p>
            <p className="text-dark-300 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-dark-400 text-sm mt-1">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="glass-card">
            <h3 className="text-white font-semibold mb-3">Payment</h3>
            <p className="text-dark-300 text-sm">Method: <span className="text-white">{order.paymentMethod.toUpperCase()}</span></p>
            <p className="text-dark-300 text-sm">Status: <span className={order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{order.paymentStatus.replace(/_/g, ' ').toUpperCase()}</span></p>
          </div>

          {order.trackingId && (
            <div className="glass-card">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><HiOutlineTruck /> Tracking</h3>
              <p className="text-dark-300 text-sm">ID: <span className="text-white font-mono">{order.trackingId}</span></p>
              {order.trackingUrl && <a href={order.trackingUrl} target="_blank" className="text-brand-400 text-sm mt-2 block">Track Shipment →</a>}
            </div>
          )}

          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={cancelOrder} className="btn-ghost text-red-400 border border-red-500/20 w-full py-3">Cancel Order</button>
          )}
        </div>
      </div>
    </div>
  );
}
