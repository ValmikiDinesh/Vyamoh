'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

import api from '@/lib/api';

export default function LoginPage() {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === 'login') {
        const data = await login(form.email, form.password);
        toast.success('Welcome back!');
        if (data.user?.role === 'admin' || data.user?.role === 'superadmin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else if (view === 'signup') {
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Account created!');
        router.push('/');
      } else if (view === 'forgot') {
        await api.post('/auth/forgot-password', { email: form.email });
        toast.success('Password reset link sent to your email!');
        setView('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8" style={{ background: 'var(--bg-card)' }}>
          <div className="text-center mb-8">
            <span className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>VYAMOH</span>
            <h1 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>
              {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              {view === 'login' 
                ? 'Sign in to your account' 
                : view === 'signup' 
                  ? 'Join the Vyamoh family' 
                  : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            )}
            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
              <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-11" required />
            </div>
            
            {view !== 'forgot' && (
              <>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>

                {view === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </>
            )}

            {view === 'signup' && (
              <input type="tel" placeholder="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required />
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-lg disabled:opacity-50">
              {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            {view === 'login' 
              ? "Don't have an account? " 
              : view === 'signup' 
                ? 'Already have an account? ' 
                : 'Remembered your password? '}
            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="font-medium" style={{ color: 'var(--brand-500)' }}>
              {view === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
