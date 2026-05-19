'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineSearch, HiOutlineMenu, HiOutlineX, HiOutlineSun, HiOutlineMoon, HiOutlineChevronDown } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useThemeStore from '@/store/useThemeStore';
import api from '@/lib/api';

const categories = [
  { name: 'Men', slug: 'men', icon: '🕶️' },
  { name: 'Women', slug: 'women', icon: '👠' },
  { name: 'Unisex', slug: 'unisex', icon: '✨' },
  { name: 'Polarized', slug: 'polarized', icon: '🌊' },
  { name: 'Sports', slug: 'sports', icon: '🚴' },
  { name: 'Premium', slug: 'premium', icon: '💎' },
  { name: 'New Arrivals', slug: 'new-arrivals', icon: '🔥' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [catOpen, setCatOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { itemCount } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimeout.current);
    if (val.length < 2) { setSuggestions(null); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/search-suggestions?q=${val}`);
        setSuggestions(data.suggestions);
      } catch { setSuggestions(null); }
    }, 300);
  };

  const submitSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${searchQuery}`);
      setSearchOpen(false);
      setSuggestions(null);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-sm' : ''}`}
        style={{
          backgroundColor: scrolled ? 'var(--bg-glass)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-color)' : 'none'
        }}>
        {/* Apple/Nike style Announcement Bar */}
        <div className="text-center text-xs py-2 font-medium tracking-wide text-white uppercase" style={{ background: '#0a0a0b' }}>
          Free Shipping & Easy Returns | Code: <span className="font-bold">WELCOME10</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-ghost p-2" aria-label="Open Menu">
              {mobileOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold tracking-widest uppercase gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>VYAMOH</span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/products" className="btn-ghost text-xs uppercase tracking-wider font-semibold">Shop All</Link>

              {/* Categories hover menu */}
              <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button className="btn-ghost text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                  Collections <HiOutlineChevronDown size={12} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-56 glass-card p-4 mt-1 space-y-1">
                      {categories.map((cat) => (
                        <Link key={cat.slug} href={`/products?category=${cat.slug}`} onClick={() => setCatOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          style={{ color: 'var(--text-primary)' }}>
                          <span>{cat.icon}</span> <span className="font-medium">{cat.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/products?category=polarized" className="btn-ghost text-xs uppercase tracking-wider font-semibold">Polarized</Link>
              <Link href="/products?category=sports" className="btn-ghost text-xs uppercase tracking-wider font-semibold">Sports</Link>
              <Link href="/products?category=premium" className="btn-ghost text-xs uppercase tracking-wider font-semibold">Premium</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <button onClick={toggleTheme} className="btn-ghost p-2 md:p-2.5" title="Toggle theme">
                {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
              </button>
              <button onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100); }} className="btn-ghost p-2 md:p-2.5">
                <HiOutlineSearch size={18} />
              </button>
              <Link href="/wishlist" className="btn-ghost p-2 md:p-2.5 hidden sm:flex">
                <HiOutlineHeart size={18} />
              </Link>
              <Link href={isAuthenticated ? (user?.role === 'admin' || user?.role === 'superadmin' ? '/admin' : '/account') : '/login'} className="btn-ghost p-2 md:p-2.5">
                <HiOutlineUser size={18} />
              </Link>
              <Link href="/cart" className="btn-ghost p-2 md:p-2.5 relative">
                <HiOutlineShoppingBag size={18} />
                {itemCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-black dark:bg-white dark:text-black">
                    {itemCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 p-4 glass border-b border-neutral-200 dark:border-neutral-800">
              <div className="max-w-2xl mx-auto relative">
                <input ref={searchRef} type="text" placeholder="Search premium sunglasses..." value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                  className="input-field text-lg pr-12 rounded-none border-b border-t-0 border-x-0 focus:ring-0 focus:border-black dark:focus:border-white" />
                <button onClick={submitSearch} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1.5">
                  <HiOutlineSearch size={18} />
                </button>
                {/* Live suggestions */}
                {suggestions && (suggestions.products?.length > 0 || suggestions.categories?.length > 0) && (
                  <div className="absolute top-full left-0 right-0 glass-card mt-2 p-3 space-y-2 max-h-72 overflow-y-auto">
                    {suggestions.categories?.map((cat) => (
                      <Link key={cat._id} href={`/products?category=${cat.slug}`} onClick={() => { setSearchOpen(false); setSuggestions(null); }}
                        className="block px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        style={{ color: 'var(--brand-500)' }}>
                        📁 {cat.name} Collection
                      </Link>
                    ))}
                    {suggestions.products?.map((p) => (
                      <Link key={p._id} href={`/products/${p.slug}`} onClick={() => { setSearchOpen(false); setSuggestions(null); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        style={{ color: 'var(--text-primary)' }}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-900">
                          {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.brand}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-80 z-[60] p-6 flex flex-col gap-4 bg-white dark:bg-neutral-950"
              style={{ borderRight: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold tracking-widest gradient-text" style={{ fontFamily: 'Outfit' }}>VYAMOH</span>
                <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2" aria-label="Close menu"><HiOutlineX size={22} /></button>
              </div>
              <nav className="flex flex-col gap-1 mt-6">
                <Link href="/products" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold uppercase tracking-wider py-3 border-b border-neutral-100 dark:border-neutral-900">Shop All</Link>
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/products?category=${cat.slug}`} onClick={() => setMobileOpen(false)}
                    className="block text-sm font-semibold uppercase tracking-wider py-3 border-b border-neutral-100 dark:border-neutral-900">
                    {cat.name}
                  </Link>
                ))}
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold uppercase tracking-wider py-3">❤️ Wishlist</Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
