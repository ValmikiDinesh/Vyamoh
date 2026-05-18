'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { HiOutlineChartBar, HiOutlineCube, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineTag, HiOutlineArrowLeft, HiOutlineMenu, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';

const sidebarLinks = [
  { href: '/admin', icon: HiOutlineChartBar, label: 'Dashboard' },
  { href: '/admin/products', icon: HiOutlineCube, label: 'Products' },
  { href: '/admin/banners', icon: HiOutlinePhotograph, label: 'Banners' },
  { href: '/admin/orders', icon: HiOutlineShoppingCart, label: 'Orders' },
  { href: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
  { href: '/admin/coupons', icon: HiOutlineTag, label: 'Coupons' },
];

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['admin', 'superadmin'].includes(user?.role))) {
      router.push('/login');
    }
  }, [isAuthenticated, user, loading]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!user || !['admin', 'superadmin'].includes(user?.role)) return null;

  return (
    <div className="flex min-h-[calc(100vh-6rem)]">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen md:h-auto w-64 p-4 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-8 md:mt-4">
          <span className="text-xl font-bold tracking-widest text-black dark:text-white" style={{ fontFamily: 'Outfit' }}>Admin Panel</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden btn-ghost p-1"><HiOutlineX size={20} /></button>
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all`}
              style={{
                background: pathname === link.href ? 'rgba(0,0,0,0.06)' : 'transparent',
                color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: pathname === link.href ? '1px solid var(--border-color)' : '1px solid transparent',
              }}>
              <link.icon size={20} /> {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Link href="/" className="flex items-center gap-2 text-sm px-4 py-2" style={{ color: 'var(--text-muted)' }}>
            <HiOutlineArrowLeft size={16} /> Back to Store
          </Link>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'var(--bg-overlay)' }} onClick={() => setSidebarOpen(false)} />}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="md:hidden p-4">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2"><HiOutlineMenu size={24} /></button>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
