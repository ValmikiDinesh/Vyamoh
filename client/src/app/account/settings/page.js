'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowLeft } from 'react-icons/hi';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user, isAuthenticated]);

  if (!user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setUpdatingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { name, phone });
      if (data.success) {
        useAuthStore.setState({ user: data.user });
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { data } = await api.put('/auth/profile', { password });
      if (data.success) {
        toast.success('Password changed successfully');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Account Link */}
      <Link href="/account" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors mb-6 text-sm font-semibold">
        <HiOutlineArrowLeft size={16} /> Back to Account
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-neutral-900 dark:text-white font-bold text-2xl" style={{ fontFamily: 'Outfit' }}>Account Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage your profile details and security settings.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h2 className="text-neutral-900 dark:text-white font-semibold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
            <HiOutlineUser className="text-neutral-400 dark:text-neutral-500" /> Personal Details
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white text-sm focus:outline-none transition-colors"
                  placeholder="Enter your name"
                />
                <HiOutlineUser className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-600" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative opacity-60">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-neutral-400 dark:text-neutral-500 text-sm cursor-not-allowed"
                />
                <HiOutlineMail className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-600" size={16} />
              </div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">Contact support to change your account email.</p>
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white text-sm focus:outline-none transition-colors"
                  placeholder="Enter your phone number"
                />
                <HiOutlinePhone className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-600" size={16} />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="btn-primary w-full mt-6 py-3 text-xs uppercase tracking-wider font-bold"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </motion.div>

        {/* Change Password Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="text-neutral-900 dark:text-white font-semibold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
            <HiOutlineLockClosed className="text-neutral-400 dark:text-neutral-500" /> Security
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white text-sm focus:outline-none transition-colors"
                  placeholder="At least 6 characters"
                />
                <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-600" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white rounded-xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white text-sm focus:outline-none transition-colors"
                  placeholder="Repeat new password"
                />
                <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-400 dark:text-neutral-600" size={16} />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="btn-primary w-full mt-6 py-3 text-xs uppercase tracking-wider font-bold"
            >
              {updatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
