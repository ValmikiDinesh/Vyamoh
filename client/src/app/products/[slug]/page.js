'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiStar, HiOutlineTruck, HiOutlineRefresh, HiOutlineShieldCheck, HiMinus, HiPlus } from 'react-icons/hi';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import useAuthStore from '@/store/useAuthStore';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        // Fetch recommendations
        if (data.product._id) {
          api.get(`/products/${data.product._id}/recommendations`)
            .then((r) => setRecommendations(r.data.recommendations || []))
            .catch(() => {});
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] shimmer" />
        <div className="space-y-6">
          <div className="h-6 shimmer w-1/4" />
          <div className="h-12 shimmer w-3/4" />
          <div className="h-8 shimmer w-1/3" />
          <div className="h-32 shimmer w-full" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-24 text-neutral-400">Sunglasses model not found.</div>;

  const currentPrice = product.salePrice || product.price;
  const comparePrice = product.compareAtPrice || product.price;
  const discount = product.discountPercent || 0;
  const allImages = product.images?.length > 0 ? product.images : [product.thumbnail];
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: currentPrice,
      image: allImages[selectedImage] || product.thumbnail,
      quantity,
      sku: product.sku
    });
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product._id);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black dark:text-white">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Image gallery / Video support */}
        <div>
          <div className="relative aspect-[3/4] bg-[#f5f5f7] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-900 overflow-hidden mb-4">
            {allImages[selectedImage] ? (
              <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🕶️</div>
            )}
            {discount > 0 && <span className="absolute top-4 left-4 bg-rose-500 text-white font-bold px-3 py-1 text-xs uppercase tracking-wider">Sale</span>}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 overflow-hidden flex-shrink-0 border bg-[#f5f5f7] dark:bg-neutral-900 transition-all ${i === selectedImage ? 'border-black dark:border-white scale-95' : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Premium Specs & Options */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">{product.brand}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 mb-4" style={{ fontFamily: 'Outfit' }}>{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold">{formatPrice(currentPrice)}</span>
              {comparePrice > currentPrice && (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatPrice(comparePrice)}</span>
                  <span className="text-xs font-bold text-rose-500">-{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Custom Badges for Polarized sunglasses */}
            {product.isPolarized && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Polarized TAC', desc: 'Blocks 99.9% Glare' },
                  { label: 'UV400 Certified', desc: '100% UVA/UVB Block' },
                  { label: 'Scratch Safe', desc: 'Dual Hardcoat' },
                  { label: 'Anti-Reflective', desc: 'Hydrophobic Coating' }
                ].map((badge) => (
                  <div key={badge.label} className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/20 p-3 text-center">
                    <span className="block text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{badge.label}</span>
                    <span className="block text-[9px] text-neutral-400 mt-0.5">{badge.desc}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-light mb-8">{product.description}</p>

            {/* Specs Table */}
            <div className="border-t border-b border-neutral-100 dark:border-neutral-900 py-6 mb-8">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-neutral-400 mb-4" style={{ fontFamily: 'Outfit' }}>Specifications Stack</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs text-neutral-600 dark:text-neutral-400">
                <div>Frame Shape: <span className="font-bold text-black dark:text-white capitalize ml-1">{product.specifications?.frameShape}</span></div>
                <div>Frame Material: <span className="font-bold text-black dark:text-white ml-1">{product.specifications?.frameMaterial}</span></div>
                <div>Lens Material: <span className="font-bold text-black dark:text-white ml-1">{product.specifications?.lensMaterial}</span></div>
                <div>Lens Color: <span className="font-bold text-black dark:text-white ml-1">{product.specifications?.lensColor}</span></div>
                <div>Frame Color: <span className="font-bold text-black dark:text-white ml-1">{product.specifications?.frameColor}</span></div>
                <div>Weight: <span className="font-bold text-black dark:text-white ml-1">{product.specifications?.weight}g</span></div>
                <div>UV Protection: <span className="font-bold text-black dark:text-white ml-1">{product.specifications?.uvProtection}</span></div>
                <div>Gender: <span className="font-bold text-black dark:text-white capitalize ml-1">{product.specifications?.gender}</span></div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8 select-none">
              <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Quantity</span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-800">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"><HiMinus size={14} /></button>
                <span className="px-5 text-sm font-bold">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"><HiPlus size={14} /></button>
              </div>
            </div>
          </div>

          {/* Checkout & Wishlist Actions */}
          <div className="flex gap-3 mt-4">
            <button onClick={handleAddToCart} className="flex-1 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest py-4.5 hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <HiOutlineShoppingBag size={16} /> Add To Bag
            </button>
            <button onClick={handleWishlistToggle}
              className="w-14 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              {inWishlist ? <HiHeart size={20} className="text-rose-500" /> : <HiOutlineHeart size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <section className="mt-24 border-t border-neutral-100 dark:border-neutral-900 pt-16">
          <div className="mb-10">
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Explore More</span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
