'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import api from '@/lib/api';

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners');
        setBanners(data.banners || []);
      } catch (err) {
        console.error('Failed to load hero banners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto rotate slider every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading) {
    return <div className="w-full h-[50vh] md:h-screen shimmer flex items-center justify-center bg-neutral-100 dark:bg-neutral-900" />;
  }

  if (banners.length === 0) return null;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full h-[50vh] md:h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {banners[current] && (
          <motion.div key={banners[current]._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full flex items-end pb-12 sm:items-center sm:pb-0">
            
            {/* Media: Video or Image */}
            <div className="absolute inset-0 w-full h-full">
              {banners[current].video ? (
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
                  <source src={banners[current].video} type="video/mp4" />
                </video>
              ) : (
                <>
                  {/* Desktop Image */}
                  <img src={banners[current].desktopImage} alt={banners[current].title} className="hidden md:block w-full h-full object-cover opacity-60 md:opacity-70" />
                  {/* Mobile Image */}
                  <img src={banners[current].mobileImage ? banners[current].mobileImage.replace('w=640', 'ar=9:16&fit=crop&w=640&h=1140') : ''} alt={banners[current].title} className="block md:hidden w-full h-full object-cover opacity-50" />
                </>
              )}
            </div>

            {/* Text content - Apple inspired minimal white layout */}
            <div className="relative max-w-7xl mx-auto px-6 sm:px-12 w-full text-white z-10 select-none">
              <div className="max-w-[90%] sm:max-w-2xl">
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-xl sm:text-3xl md:text-6xl font-bold tracking-tight mb-2 sm:mb-4" style={{ fontFamily: 'Outfit' }}>
                  {banners[current].title}
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-[11px] sm:text-xs md:text-xl text-neutral-200 mb-4 sm:mb-8 font-light leading-relaxed">
                  {banners[current].subtitle}
                </motion.p>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                  <Link href={banners[current].ctaLink} className="inline-block bg-white text-black font-semibold px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-[10px] sm:text-sm uppercase tracking-wider transition-all duration-300 hover:bg-neutral-200 active:scale-95">
                    {banners[current].ctaText}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm hidden md:flex items-center justify-center text-white transition-all hover:bg-white/10" aria-label="Previous banner">
            <HiOutlineChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm hidden md:flex items-center justify-center text-white transition-all hover:bg-white/10" aria-label="Next banner">
            <HiOutlineChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 md:left-1/2 md:-translate-x-1/2 right-6 md:right-auto z-20 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
