'use client';
import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import useThemeStore from '@/store/useThemeStore';

export default function AuthProvider({ children }) {
  const { fetchProfile, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
