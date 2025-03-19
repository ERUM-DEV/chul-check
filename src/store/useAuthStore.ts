import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,

  login: async (pin: string) => {
    try {
      const success = await window.electronAPI.login(pin);
      if (success) {
        set({ isAuthenticated: true });
      }
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: () => {
    window.electronAPI.logout();
    set({ isAuthenticated: false });
  },
})) 