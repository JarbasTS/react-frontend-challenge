import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (email) => set({ user: { email }, token: crypto.randomUUID() }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'libris-auth' }
  )
);
