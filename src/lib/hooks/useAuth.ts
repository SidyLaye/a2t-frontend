"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { authApi } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import type { LoginRequest, RegisterRequest } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, accessToken, entrepreneurRoles, setTokens, setUser, logout: storeLogout } = useAuthStore();
  const { clearTenant, activeEntrepreneurId, setActiveTenant } = useTenantStore();

  const isAuthenticated = !!accessToken;

  const { data: meData } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (tokens) => {
      setTokens(tokens);
      // Set cookie for middleware
      document.cookie = `a2t-access-token=${tokens.access}; path=/; max-age=86400; SameSite=Lax`;

      // Check if user is an accountant or has multiple companies
      const roles = useAuthStore.getState().entrepreneurRoles;
      const tenantIds = Object.keys(roles);
      const isAccountant = Object.values(roles).some((role) => role === "accountant");

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });

      if (tenantIds.length > 1 || isAccountant) {
        // Go to Hub to select dossier
        router.push("/hub");
      } else if (tenantIds.length === 1) {
        // Only one company, auto-select and go to dashboard
        setActiveTenant(tenantIds[0]);
        router.push("/dashboard");
      } else {
        // No company yet, go to dashboard (will show empty state or onboarding)
        router.push("/dashboard");
      }
    },
    onError: () => {
      toast.error("Email ou mot de passe incorrect");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (res) => {
      setTokens(res.tokens);
      setUser(res.user);
      document.cookie = `a2t-access-token=${res.tokens.access}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Erreur lors de l'inscription");
    },
  });

  const logout = () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => { });
    }
    storeLogout();
    clearTenant();
    document.cookie = "a2t-access-token=; path=/; max-age=0";
    queryClient.clear();
    router.push("/login");
  };

  return {
    user: meData?.user ?? user,
    roles: meData?.roles ?? [],
    isAuthenticated,
    entrepreneurRoles,
    login: loginMutation.mutate,
    loginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerPending: registerMutation.isPending,
    logout,
  };
}
