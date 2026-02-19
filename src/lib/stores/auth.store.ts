import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, RoleName, AuthTokens } from "@/types/auth";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  entrepreneurRoles: Record<string, RoleName>;
  isHydrated: boolean;

  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      entrepreneurRoles: {},
      isHydrated: false,

      setTokens: (tokens) => {
        let entrepreneurRoles: Record<string, RoleName> = {};
        try {
          const decoded = jwtDecode<{ entrepreneur_roles?: Record<string, RoleName> }>(tokens.access);
          entrepreneurRoles = decoded.entrepreneur_roles ?? {};
        } catch {
          // Invalid token, ignore
        }
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          entrepreneurRoles,
        });
      },

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          entrepreneurRoles: {},
        }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "a2t-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        entrepreneurRoles: state.entrepreneurRoles,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
