'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register } = useAuthStore();
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
        setShowAuthModal(false);
      } else if (view === 'signup') {
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Account created!');
        setShowAuthModal(false);
      } else if (view === 'forgot') {
        await api.post('/auth/forgot-password', { email: form.email });
        toast.success('Password reset link sent to your email!');
        setView('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white dark:bg-neutral-950 w-full max-w-md p-8 border border-neutral-100 dark:border-neutral-900 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <HiOutlineX size={18} />
          </button>

          <div className="text-center mb-8">
            <span className="text-2xl font-bold tracking-wider gradient-text" style={{ fontFamily: 'Outfit' }}>VYAMOH</span>
            <h2 className="text-xl font-bold mt-4 text-black dark:text-white">
              {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {view === 'login' 
                ? 'Access your account to add items to bag' 
                : view === 'signup' 
                  ? 'Join us to complete your order' 
                  : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                required
              />
            )}

            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                required
              />
            </div>

            {view !== 'forgot' && (
              <>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-11 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white"
                  >
                    {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>

                {view === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </>
            )}

            {view === 'signup' && (
              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-xs mt-6 text-neutral-500 dark:text-neutral-400">
            {view === 'login' 
              ? "Don't have an account? " 
              : view === 'signup' 
                ? 'Already have an account? ' 
                : 'Remembered your password? '}
            <button
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="font-bold text-black dark:text-white underline ml-1"
            >
              {view === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
