'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiOutlineEye } from 'react-icons/hi';
import { formatPrice } from '@/lib/utils';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useState } from 'react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const isWishlisted = isInWishlist(product._id);
  const img1 = product.thumbnail || product.images?.[0];
  const img2 = product.images?.[1] || img1;
  const hasVideo = product.videos && product.videos.length > 0;
  const videoUrl = hasVideo ? product.videos[0] : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: product.effectivePrice || product.price,
      image: img1,
      quantity: 1,
      sku: product.sku
    });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try { await toggleWishlist(product._id); } catch {}
  };

  const openQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const discount = product.discountPercent || 0;

  return (
    <>
      <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f7] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-900 rounded-none transition-all duration-500">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
              {product.isPolarized && (
                <span className="text-[9px] uppercase tracking-wider font-semibold bg-blue-600 text-white px-2 py-0.5 shadow-sm">
                  Polarized
                </span>
              )}
              {product.isNewArrival && (
                <span className="text-[9px] uppercase tracking-wider font-semibold bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 shadow-sm">
                  New
                </span>
              )}
              {discount > 0 && (
                <span className="text-[9px] uppercase tracking-wider font-semibold bg-rose-500 text-white px-2 py-0.5 shadow-sm">
                  Sale
                </span>
              )}
            </div>

            {/* Wishlist Icon */}
            <button onClick={handleWishlist} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition-transform active:scale-90 hover:bg-white dark:hover:bg-black shadow-sm">
              {isWishlisted ? <HiHeart size={16} className="text-rose-500" /> : <HiOutlineHeart size={16} />}
            </button>

            {/* Video preview on hover or Alternate Image */}
            <div className="w-full h-full">
              {hovered && videoUrl ? (
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src={videoUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={hovered ? img2 : img1} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onLoad={() => setImgLoaded(true)} loading="lazy" />
              )}
            </div>

            {/* Premium quick action buttons overlay on hover */}
            <div className="absolute bottom-4 left-4 right-4 hidden md:flex gap-2 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
              <button onClick={handleAddToCart} className="flex-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-wider py-3 shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                <HiOutlineShoppingBag size={14} /> Add To Cart
              </button>
              <button onClick={openQuickView} className="w-11 bg-white text-black dark:bg-neutral-850 dark:text-white flex items-center justify-center shadow-md hover:bg-neutral-100 transition-all" title="Quick View">
                <HiOutlineEye size={16} />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="pt-4 pb-2 px-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500">{product.brand}</span>
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white mt-0.5 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">{product.name}</h3>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatPrice(product.salePrice || product.price)}</span>
              {product.compareAtPrice > (product.salePrice || product.price) && (
                <>
                  <span className="text-xs line-through text-neutral-400">{formatPrice(product.compareAtPrice)}</span>
                  <span className="text-[10px] text-rose-500 font-bold">-{discount}% OFF</span>
                </>
              )}
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(product.rating))}</span>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">({product.reviewCount})</span>
              </div>
            )}

            {/* Mobile Touch Add to Cart Button - un-clutters the product image while providing perfect touch UX */}
            <button onClick={handleAddToCart} className="w-full mt-3 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-wider py-2.5 transition-all active:scale-95 flex items-center justify-center gap-1.5 md:hidden border border-black dark:border-white">
              <HiOutlineShoppingBag size={13} /> Add To Cart
            </button>
          </div>
        </Link>
      </div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
