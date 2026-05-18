'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/my-orders?page=${page}&limit=10`);
        setOrders(data.orders || []);
        setPagination(data.pagination || {});
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Orders</h1>
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass-card"><p className="text-dark-400 text-lg mb-4">No orders yet</p><Link href="/products" className="btn-primary">Shop Now</Link></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/account/orders/${order._id}`} className="glass-card p-5 block hover:border-brand-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-semibold">{order.orderNumber}</span>
                    <span className="text-dark-400 text-sm ml-3">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={getStatusColor(order.status)}>{order.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300 text-sm">{order.items.length} items · {order.paymentMethod.toUpperCase()}</span>
                  <span className="text-white font-bold text-lg">{formatPrice(order.totalAmount)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl font-medium ${p === page ? 'bg-brand-500 text-white' : 'bg-white/5 text-dark-300 hover:bg-white/10'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
