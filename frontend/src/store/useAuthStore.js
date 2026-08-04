import { create } from 'zustand';
import api from '../services/api';

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id,
    role: user.role ? user.role.toUpperCase() : ''
  };
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || '',
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ error: null, loading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      localStorage.setItem('token', data.token);
      set({ token: data.token, user: normalizeUser(data.user), loading: false });
      
      // Load full user details
      await get().loadUser();
      
      return get().user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  register: async (name, email, password, role, extraInfo) => {
    set({ error: null, loading: true });
    try {
      const response = await api.post('/auth/register', { name, email, password, role, extraInfo });
      const data = response.data;

      localStorage.setItem('token', data.token);
      set({ token: data.token, user: normalizeUser(data.user), loading: false });
      
      // Load full user details
      await get().loadUser();
      
      return get().user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  loginWithGoogle: async (googleData) => {
    set({ error: null, loading: true });
    try {
      const response = await api.post('/auth/google', googleData);
      const data = response.data;

      localStorage.setItem('token', data.token);
      set({ token: data.token, user: normalizeUser(data.user), loading: false });
      
      await get().loadUser();
      return get().user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Google Auth failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: '', user: null, error: null });
  },

  loadUser: async () => {
    const { token } = get();
    if (!token) {
      set({ user: null, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: normalizeUser(response.data), loading: false });
    } catch (err) {
      console.error('Error fetching current user:', err);
      get().logout();
      set({ loading: false });
    }
  },

  updateEmergencyContacts: async (contacts) => {
    try {
      const response = await api.put('/auth/contacts', { contacts });
      const data = response.data;
      
      set({ user: normalizeUser(data) });
      return data;
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update contacts';
      throw new Error(errMsg);
    }
  }
}));

export default useAuthStore;

