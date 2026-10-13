import { create } from 'zustand';
import { api, UserProfile } from '../api/client';

interface AuthStoreState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOffline: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';

  checkAuth: () => Promise<void>;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setOfflineStatus: (offline: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isOffline: false,
  authModalOpen: false,
  authModalMode: 'login',

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await api.getMe();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, isOffline: api.isOffline });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, isOffline: api.isOffline });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false, isOffline: true });
    }
  },

  login: async (identifier: string, pass: string) => {
    const guestSessions = api.getLocalGuestSessions();
    const res = await api.login({
      email_or_username: identifier,
      password: pass,
      guest_sessions: guestSessions.length > 0 ? guestSessions : undefined,
    });
    set({
      user: res.user,
      isAuthenticated: true,
      authModalOpen: false,
      isOffline: false,
    });
  },

  register: async (username: string, email: string, pass: string) => {
    const guestSessions = api.getLocalGuestSessions();
    const res = await api.register({
      username,
      email,
      password: pass,
      guest_sessions: guestSessions.length > 0 ? guestSessions : undefined,
    });
    set({
      user: res.user,
      isAuthenticated: true,
      authModalOpen: false,
      isOffline: false,
    });
  },

  logout: () => {
    api.setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  openAuthModal: (mode: 'login' | 'register' = 'login') => {
    set({ authModalOpen: true, authModalMode: mode });
  },

  closeAuthModal: () => {
    set({ authModalOpen: false });
  },

  setOfflineStatus: (offline: boolean) => {
    set({ isOffline: offline });
  },
}));
