import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    try {
      const { data } = await api.get('/wishlist');
      set({ items: data.wishlist?.products || [] });
    } catch {}
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      set({ items: data.wishlist?.products || [] });
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error('Login required');
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((p) => (p._id || p) === productId);
  },
}));

export default useWishlistStore;
