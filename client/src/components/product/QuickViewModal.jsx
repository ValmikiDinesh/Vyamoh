'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineShoppingBag, HiBadgeCheck, HiOutlineEye } from 'react-icons/hi';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';

export default function QuickViewModal({ product, onClose }) {
  const [selectedImg, setSelectedImg] = useState(product?.thumbnail || product?.images?.[0] || '');
  const { addItem } = useCartStore();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      _id: product._id,
      name: product.name,
      price: product.effectivePrice,
      image: selectedImg,
      quantity: 1,
      sku: product.sku
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white dark:bg-neutral-950 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl z-10 grid md:grid-cols-2">
          
          {/* Close button */}
          <button onClick={onClose} className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
            <HiOutlineX size={18} />
          </button>

          {/* Left: Product Images */}
          <div className="p-6 bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-between">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900">
              <img src={selectedImg} alt={product.name} className="w-full h-full object-contain" />
            </div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImg(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border bg-white dark:bg-neutral-950 transition-all ${selectedImg === img ? 'border-black dark:border-white scale-95' : 'border-neutral-200 dark:border-neutral-800 opacity-60'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Specs & Purchasing */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-3">
                {product.isPolarized && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 px-2.5 py-1 rounded">
                    🌊 Polarized Tech
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1 rounded">
                    🔥 New Drop
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2" style={{ fontFamily: 'Outfit' }}>
                {product.name}
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">{product.brand} · SKU: {product.sku}</p>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(product.effectivePrice)}
                </span>
                {product.compareAtPrice > product.effectivePrice && (
                  <>
                    <span className="text-lg line-through text-neutral-400">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="text-sm font-semibold text-rose-500">
                      -{product.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                {product.description?.slice(0, 160)}...
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-neutral-100 dark:border-neutral-900 py-4 mb-6 text-xs text-neutral-600 dark:text-neutral-400">
                <div>Frame Shape: <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">{product.specifications?.frameShape}</span></div>
                <div>Frame Material: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications?.frameMaterial}</span></div>
                <div>Lens Material: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications?.lensMaterial}</span></div>
                <div>Lens Color: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications?.lensColor}</span></div>
              </div>
            </div>

            {/* Add to Cart button */}
            <button onClick={handleAddToCart} className="w-full btn-primary bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 text-white rounded-full py-4 flex items-center justify-center gap-2 tracking-wide uppercase text-xs font-bold transition-all duration-300">
              <HiOutlineShoppingBag size={18} /> Add To Bag
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
