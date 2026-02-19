import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Entrepreneur } from "@/types/entrepreneur";

interface TenantState {
  activeEntrepreneurId: string | null;
  activeEntrepreneur: Entrepreneur | null;

  setActiveTenant: (id: string, entrepreneur?: Entrepreneur) => void;
  setActiveEntrepreneur: (entrepreneur: Entrepreneur) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeEntrepreneurId: null,
      activeEntrepreneur: null,

      setActiveTenant: (id, entrepreneur) =>
        set({
          activeEntrepreneurId: id,
          activeEntrepreneur: entrepreneur ?? null,
        }),

      setActiveEntrepreneur: (entrepreneur) =>
        set({ activeEntrepreneur: entrepreneur }),

      clearTenant: () =>
        set({ activeEntrepreneurId: null, activeEntrepreneur: null }),
    }),
    {
      name: "a2t-tenant",
      partialize: (state) => ({
        activeEntrepreneurId: state.activeEntrepreneurId,
      }),
    }
  )
);
