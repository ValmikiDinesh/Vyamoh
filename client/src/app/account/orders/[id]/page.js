'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineArrowLeft } from 'react-icons/hi';
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
  if (!order) return <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">Order not found</div>;

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Orders Link */}
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors mb-6 text-sm font-semibold">
        <HiOutlineArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>{order.orderNumber}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider text-center py-1.5 px-4 rounded-xl border ${getStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Status tracker */}
      {!['cancelled', 'returned', 'refunded'].includes(order.status) && (
        <div className="glass-card mb-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] relative py-4 px-2">
            <div className="absolute top-9 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-800" />
            <div className="absolute top-9 left-0 h-0.5 bg-black dark:bg-white transition-all" style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                  i <= currentStep 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                    : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-800'
                }`}>
                  {i < currentStep ? <HiOutlineCheck size={18} /> : i + 1}
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2.5 font-bold uppercase tracking-wider">{step.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="glass-card">
          <h3 className="text-neutral-900 dark:text-white font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Items ({order.items.length})</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-neutral-900 dark:text-white font-semibold">{item.name}</p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">{item.color ? `${item.color} · ` : ''}Qty: {item.quantity}</p>
                </div>
                <span className="text-neutral-900 dark:text-white font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 dark:border-neutral-800/60 mt-6 pt-4 space-y-2 text-xs uppercase tracking-wider font-semibold">
            <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Subtotal</span><span className="text-neutral-900 dark:text-white">{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Shipping</span><span className="text-neutral-900 dark:text-white">{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span></div>
            {order.couponDiscount > 0 && <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Discount</span><span>-{formatPrice(order.couponDiscount)}</span></div>}
            <div className="flex justify-between font-extrabold text-base text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-neutral-800/60 pt-4"><span className="normal-case">Total</span><span>{formatPrice(order.totalAmount)}</span></div>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-neutral-900 dark:text-white font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}><HiOutlineLocationMarker className="text-neutral-400 dark:text-neutral-500" /> Delivery Address</h3>
            <p className="text-neutral-900 dark:text-white font-bold text-sm">{order.shippingAddress.fullName}</p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1 leading-relaxed">{order.shippingAddress.addressLine1}</p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-2">📞 {order.shippingAddress.phone}</p>
          </div>

          <div className="glass-card">
            <h3 className="text-neutral-900 dark:text-white font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Payment</h3>
            <div className="space-y-2 text-xs uppercase font-semibold tracking-wider">
              <p className="text-neutral-500 dark:text-neutral-400">Method: <span className="text-neutral-900 dark:text-white font-bold">{order.paymentMethod.toUpperCase()}</span></p>
              <p className="text-neutral-500 dark:text-neutral-400">Status: <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{order.paymentStatus.toUpperCase()}</span></p>
            </div>
          </div>

          {order.trackingId && (
            <div className="glass-card">
              <h3 className="text-neutral-900 dark:text-white font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}><HiOutlineTruck className="text-neutral-400 dark:text-neutral-500" /> Tracking</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs uppercase font-semibold tracking-wider">ID: <span className="text-neutral-900 dark:text-white font-mono font-bold ml-1">{order.trackingId}</span></p>
              {order.trackingUrl && <a href={order.trackingUrl} target="_blank" className="btn-ghost text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider block text-center mt-4 border border-neutral-200 dark:border-neutral-800">Track Shipment →</a>}
            </div>
          )}

          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={cancelOrder} className="w-full py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-500/20 dark:hover:bg-red-500/[0.02] bg-transparent transition-all">Cancel Order</button>
          )}
        </div>
      </div>
    </div>
  );
}
