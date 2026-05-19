import { create } from 'zustand';
import api from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  showAuthModal: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  setShowAuthModal: (showAuthModal) => set({ showAuthModal }),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  register: async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  googleLogin: async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken });
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch (e) {}
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile');
      set({ user: data.user, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));

export default useAuthStore;
