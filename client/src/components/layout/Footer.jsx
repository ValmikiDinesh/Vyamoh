'use client';
import Link from 'next/link';
import { HiOutlineMail } from 'react-icons/hi';
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from 'react-icons/fa';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe');
    }
  };

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-2xl p-8 md:p-12 text-center mb-16 relative overflow-hidden border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/20">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 mb-2 block">Newsletter</span>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-black dark:text-white" style={{ fontFamily: 'Outfit' }}>Stay in the Loop</h3>
          <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-xs font-medium uppercase tracking-wider">Get exclusive drop alerts, collection announcements, and styling guides.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-lg mx-auto relative z-10">
            <div className="relative flex-1">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input type="email" placeholder="YOUR EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11 text-xs uppercase font-semibold tracking-wider bg-transparent border-neutral-200 dark:border-neutral-800" required />
            </div>
            <button type="submit" className="bg-black text-white dark:bg-white dark:text-black text-xs uppercase font-extrabold tracking-widest px-8 py-3.5 hover:opacity-90 transition-all">Subscribe</button>
          </form>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand & Socials */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <span className="text-2xl font-black tracking-widest text-black dark:text-white" style={{ fontFamily: 'Outfit' }}>VYAMOH</span>
            <p className="mt-4 text-xs leading-relaxed max-w-sm font-light text-neutral-500 dark:text-neutral-400">
              Premium sunglasses. Crafted with ultra-lightweight frames, polarized TAC lenses, and certified UV400 protection.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[FaInstagram, FaTwitter, FaFacebookF, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-black dark:text-white mb-4" style={{ fontFamily: 'Outfit' }}>Collections</h4>
            <ul className="space-y-2 text-xs">
              {[{ label: 'Men', href: '/products?gender=men' }, { label: 'Women', href: '/products?gender=women' }, { label: 'Polarized Lenses', href: '/products?polarized=true' }, { label: 'All Models', href: '/products' }].map((l) => (
                <li key={l.href}><Link href={l.href} className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white font-medium">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-black dark:text-white mb-4" style={{ fontFamily: 'Outfit' }}>Studio</h4>
            <ul className="space-y-2 text-xs">
              {['Design Ethos', 'Craftsmanship', 'Polarized TAC Tech', 'Sustainability'].map((item) => (
                <li key={item}><a href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white font-medium">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-black dark:text-white mb-4" style={{ fontFamily: 'Outfit' }}>Support</h4>
            <ul className="space-y-2 text-xs">
              {['Care & Maintenance', 'Returns & Exchanges', '1-Year Warranty', 'Secure Razorpay Payments'].map((item) => (
                <li key={item}><a href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white font-medium">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-neutral-400">© {new Date().getFullYear()} VYAMOH Eyewear. All rights reserved.</p>
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              {['Razorpay Secure', 'UPI Enabled', 'Visa', 'Mastercard', 'Cash On Delivery'].map((method) => (
                <span key={method} className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 text-neutral-400">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
