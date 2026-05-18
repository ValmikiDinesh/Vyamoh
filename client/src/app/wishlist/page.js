'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag } from 'react-icons/hi';
import useWishlistStore from '@/store/useWishlistStore';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items, fetchWishlist } = useWishlistStore();

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <HiOutlineHeart className="mx-auto text-dark-600 mb-6" size={80} />
          <h2 className="text-white text-2xl font-bold mb-3">Your wishlist is empty</h2>
          <p className="text-dark-400 mb-8">Save items you love for later</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2"><HiOutlineShoppingBag /> Browse Products</Link>
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
