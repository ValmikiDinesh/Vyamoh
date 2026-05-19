'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiArrowRight, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineRefresh, HiOutlineEye, HiOutlineSparkles, HiOutlineStar } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import HeroSlider from '@/components/home/HeroSlider';

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, newRes, bestRes, catRes] = await Promise.all([
          api.get('/products?limit=8').catch(() => ({ data: { products: [] } })),
          api.get('/products/new-arrivals').catch(() => ({ data: { products: [] } })),
          api.get('/products/bestsellers').catch(() => ({ data: { products: [] } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
        ]);
        setTrending(trendRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        setBestsellers(bestRes.data.products || []);
        setDbCategories(catRes.data.categories || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const staticCategories = [
    { name: 'Men', slug: 'men', img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80' },
    { name: 'Women', slug: 'women', img: 'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=600&q=80' },
    { name: 'Unisex', slug: 'unisex', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80' },
    { name: 'Polarized', slug: 'polarized', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Sports', slug: 'sports', img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80' },
    { name: 'Premium', slug: 'premium', img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80' }
  ];

  const categories = dbCategories.length > 0
    ? dbCategories.map(c => {
        const staticMatch = staticCategories.find(sc => sc.slug === c.slug);
        return {
          name: c.name,
          slug: c.slug,
          img: c.image || staticMatch?.img || 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'
        };
      })
    : staticCategories;

  const features = [
    { icon: HiOutlineSparkles, title: 'UV400 Protection', desc: 'Blocks 100% of harmful UVA and UVB radiation.' },
    { icon: HiOutlineShieldCheck, title: 'Premium Craftsmanship', desc: 'Crafted using Italian acetate & surgical titanium.' },
    { icon: HiOutlineTruck, title: 'Insured Shipping', desc: 'Secure delivery inside customizable premium casing.' },
    { icon: HiOutlineRefresh, title: 'Easy Returns', desc: 'Enjoy hassle-free returns on any shades within 15 days.' },
  ];

  const reviews = [
    { name: 'Arjun Mehta', rating: 5, text: 'Absolutely pristine quality. The polarized lenses perform exceptionally well during drives. Feels like premium Italian craftsmanship.', avatar: '🕶️' },
    { name: 'Sarah Khan', rating: 5, text: 'The titanium frames are so light I forget they are on. Clean minimal packaging and blazing fast shipping. Highly recommend.', avatar: '✨' },
    { name: 'Nikita Rao', rating: 5, text: 'Beautiful sleek designs. Picked up the Luna Rose Gold and received tons of compliments. Absolutely in love!', avatar: '🔥' },
  ];

  // Countdown timer (3 days limit)
  const [countdown, setCountdown] = useState({ hours: 72, mins: 0, secs: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-neutral-950 text-black dark:text-white transition-colors duration-500">
      
      {/* 1. Dynamic Hero Slideshow */}
      <HeroSlider />

      {/* 2. Featured Sunglasses Categories (Apple/Nike style clean squares) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Curated Collections</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group relative overflow-hidden aspect-[4/5] bg-neutral-100 dark:bg-neutral-900">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>{cat.name}</h3>
                <span className="text-xs font-semibold tracking-wider opacity-90 inline-flex items-center gap-1 mt-1 border-b border-white pb-0.5">Explore <HiArrowRight size={10} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Sunglasses */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-t border-neutral-100 dark:border-neutral-900">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">The Season's Best</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>Trending Shades</h2>
          </div>
          <Link href="/products" className="text-xs uppercase font-bold tracking-widest border-b border-black dark:border-white pb-0.5 hover:opacity-80">View All</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trending.slice(0, 4).map((p, idx) => (
              <ProductCard key={p._id} product={p} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 4. New Arrivals */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Fresh Release</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>New Arrivals</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] shimmer" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((p, idx) => (
                <ProductCard key={p._id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Best Sellers */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Top Rated & Loved</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>Best Sellers</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestsellers.slice(0, 4).map((p, idx) => (
              <ProductCard key={p._id} product={p} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Limited-Time Offer Countdown Banner */}
      <section className="bg-black text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900 opacity-60 mix-blend-multiply" />
        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-400 mb-2">Exclusive Promo Drop</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: 'Outfit' }}>Limited Launch Offer</h2>
          <p className="text-neutral-300 text-sm md:text-base max-w-lg mb-8 font-light">Get custom premium cases, micro-fiber travel pouches, and a comprehensive lens cleaning kit free with every order.</p>
          
          {/* Countdown Clock */}
          <div className="flex gap-4 md:gap-6 mb-8 select-none">
            {[['HOURS', countdown.hours], ['MINS', countdown.mins], ['SECS', countdown.secs]].map(([unit, val]) => (
              <div key={unit} className="w-20 h-20 md:w-24 md:h-24 border border-white/20 flex flex-col items-center justify-center rounded-none bg-white/5">
                <span className="text-2xl md:text-4xl font-extrabold">{val.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-neutral-400 mt-1">{unit}</span>
              </div>
            ))}
          </div>

          <Link href="/products" className="bg-white text-black font-semibold text-xs uppercase tracking-wider py-4 px-8 hover:bg-neutral-200 transition-all">
            Claim Offer Now
          </Link>
        </div>
      </section>

      {/* 7. Why Choose Us (Premium Optics specific) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Pure Engineering</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>Optics Perfected</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feat) => (
            <div key={feat.title} className="text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-black dark:text-white mb-4">
                <feat.icon size={22} />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider mb-2" style={{ fontFamily: 'Outfit' }}>{feat.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Verified Voices</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: 'Outfit' }}>Customer Reviews</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-950 p-8 border border-neutral-100 dark:border-neutral-900">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {Array.from({ length: rev.rating }).map((_, i) => <HiOutlineStar key={i} size={16} />)}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 italic mb-6 leading-relaxed">"{rev.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rev.avatar}</span>
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight">{rev.name}</h4>
                    <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Verified Buyer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}
