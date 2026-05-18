import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  itemCount: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      const itemCount = data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      set({ cart: data.cart, itemCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToCart: async (productId, variantId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, variantId, quantity });
      const itemCount = data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      set({ cart: data.cart, itemCount });
      toast.success('Added to cart!');
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Please login to add items to your cart');
      } else {
        toast.error(err.response?.data?.message || 'Failed to add to cart');
      }
    }
  },

  addItem: async (item) => {
    const productId = item._id || item.productId;
    const variantId = item.variantId || null;
    const quantity = item.quantity || 1;
    await get().addToCart(productId, variantId, quantity);
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      const itemCount = data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      set({ cart: data.cart, itemCount });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      const itemCount = data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      set({ cart: data.cart, itemCount });
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ cart: null, itemCount: 0 });
    } catch {}
  },
}));

export default useCartStore;
