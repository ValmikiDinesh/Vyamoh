'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineArrowLeft } from 'react-icons/hi';
import useWishlistStore from '@/store/useWishlistStore';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items, fetchWishlist } = useWishlistStore();

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Account Link */}
      <Link href="/account" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors mb-6 text-sm font-semibold">
        <HiOutlineArrowLeft size={16} /> Back to Account
      </Link>

      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8" style={{ fontFamily: 'Outfit' }}>My Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <HiOutlineHeart className="mx-auto text-neutral-300 dark:text-neutral-700 mb-6" size={80} />
          <h2 className="text-neutral-900 dark:text-white text-2xl font-bold mb-3" style={{ fontFamily: 'Outfit' }}>Your wishlist is empty</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Save items you love for later</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-3.5 px-6">
            <HiOutlineShoppingBag size={16} /> Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((product, i) => (
            <ProductCard key={product._id || product} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
