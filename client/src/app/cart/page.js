'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiMinus, HiPlus, HiOutlineShoppingBag, HiArrowRight } from 'react-icons/hi';
import useCartStore from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 99900 ? 0 : 4900;
  const total = subtotal + shipping;

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center text-black dark:text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
            <HiOutlineShoppingBag className="text-neutral-400 dark:text-neutral-500" size={36} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3" style={{ fontFamily: 'Outfit' }}>Your Shopping Bag is Empty</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto mb-8 font-light">Explore our curated sunglasses drops to find your perfect custom shades.</p>
          <Link href="/products" className="inline-block bg-black text-white dark:bg-white dark:text-black text-xs uppercase font-bold tracking-widest py-4 px-8 hover:opacity-90 active:scale-95 transition-all">
            Start Exploring
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black dark:text-white">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ fontFamily: 'Outfit' }}>
        Shopping Cart <span className="text-neutral-400 dark:text-neutral-500 font-light text-xl ml-2">({items.length} Custom Model{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items Grid */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900 p-6 flex gap-6 items-center">
              
              {/* Product Thumbnail image frame */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🕶️</span>
                )}
              </div>

              {/* Product Specifications & Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white truncate">{item.name}</h3>
                    {(item.color || item.frameSize) && (
                      <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                        {item.color}{item.frameSize ? ` · ${item.frameSize}` : ''}
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeItem(item._id)} className="text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1" title="Remove Item">
                    <HiOutlineTrash size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-6">
                  {/* Quantity adjustment panel */}
                  <div className="flex items-center border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950">
                    <button onClick={() => updateItem(item._id, item.quantity - 1)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-900 transition-colors"><HiMinus size={12} /></button>
                    <span className="px-4 text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateItem(item._id, item.quantity + 1)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-900 transition-colors"><HiPlus size={12} /></button>
                  </div>
                  
                  {/* Item Price details */}
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary panel */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-900 p-8 sticky top-32">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'Outfit' }}>Order Summary</h3>
            
            <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-200/60 dark:border-neutral-800/80 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-light">Subtotal</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-light">Shipping</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {shipping === 0 ? <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Free</span> : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-neutral-400 mt-1 italic">Free delivery on premium orders over ₹999</p>
              )}
            </div>

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-sm font-extrabold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout" className="block w-full bg-black text-white dark:bg-white dark:text-black text-center font-bold text-xs uppercase tracking-widest py-4 hover:opacity-90 active:scale-95 transition-all">
              Proceed to Checkout
            </Link>

            <Link href="/products" className="block text-center text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 hover:text-black dark:hover:text-white mt-4 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
