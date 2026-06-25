import { create } from "zustand";

export type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = "kitchenos.session";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ token: null, user: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const { token, user } = JSON.parse(raw);
      set({ token, user });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
}));
