'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLocationMarker, HiOutlineCog, HiOutlineLogout, HiOutlineChevronRight } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function AccountPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/orders/my-orders?limit=5').then((r) => setOrders(r.data.orders || [])).catch(() => {});
  }, [isAuthenticated]);

  if (!user) return null;

  const menuItems = [
    { href: '/account/orders', icon: HiOutlineShoppingBag, label: 'My Orders', count: user.totalOrders },
    { href: '/wishlist', icon: HiOutlineHeart, label: 'Wishlist' },
    { href: '/account/addresses', icon: HiOutlineLocationMarker, label: 'Addresses', count: user.addresses?.length },
    { href: '/account/settings', icon: HiOutlineCog, label: 'Settings' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-900 dark:text-white font-bold text-2xl border border-neutral-200/40 dark:border-neutral-800/40">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-neutral-900 dark:text-white font-bold text-xl" style={{ fontFamily: 'Outfit' }}>{user.name}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">{user.email}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="glass-card p-4 flex items-center justify-between group hover:border-neutral-900/30 dark:hover:border-white/30">
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                <span className="text-neutral-900 dark:text-white font-medium text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== undefined && <span className="text-neutral-500 dark:text-neutral-400 text-xs">{item.count}</span>}
                <HiOutlineChevronRight size={16} className="text-neutral-400 dark:text-neutral-600" />
              </div>
            </Link>
          ))}
          <button onClick={() => { logout(); router.push('/'); }} className="w-full glass-card p-4 flex items-center gap-3 text-red-600 dark:text-red-400 hover:border-red-500/20 dark:hover:border-red-500/20">
            <HiOutlineLogout size={20} /> <span className="font-medium text-sm">Logout</span>
          </button>
        </div>

        {/* Recent orders */}
        <div className="md:col-span-2">
          <h2 className="text-neutral-900 dark:text-white font-semibold text-lg mb-4" style={{ fontFamily: 'Outfit' }}>Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="glass-card text-center py-10">
              <p className="text-neutral-500 dark:text-neutral-400">No orders yet</p>
              <Link href="/products" className="btn-primary mt-4 inline-block text-xs uppercase tracking-wider font-bold">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order._id} href={`/account/orders/${order._id}`} className="glass-card p-4 block hover:border-neutral-900/30 dark:hover:border-white/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-900 dark:text-white font-medium text-sm">{order.orderNumber}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">{formatDate(order.createdAt)} · {order.items.length} items</span>
                    <span className="text-neutral-900 dark:text-white font-bold">{formatPrice(order.totalAmount)}</span>
                  </div>
                </Link>
              ))}
              <Link href="/account/orders" className="btn-ghost text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider block text-center mt-4 border border-neutral-200 dark:border-neutral-800">View All Orders →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
