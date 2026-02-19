"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { useTenantStore } from "@/lib/stores/tenant.store";
import type { RoleName } from "@/types/auth";

const ROLE_HIERARCHY: Record<RoleName, number> = {
  owner: 5,
  admin: 4,
  accountant: 3,
  collaborator: 2,
  read_only: 1,
};

export function usePermission() {
  const { entrepreneurRoles } = useAuthStore();
  const { activeEntrepreneurId } = useTenantStore();

  const currentRole: RoleName | null =
    activeEntrepreneurId ? (entrepreneurRoles[activeEntrepreneurId] ?? null) : null;

  const hasMinRole = (minRole: RoleName): boolean => {
    if (!currentRole) return false;
    return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[minRole];
  };

  return {
    currentRole,
    isOwner: currentRole === "owner",
    isAdmin: hasMinRole("admin"),
    isAccountant: hasMinRole("accountant"),
    isCollaborator: hasMinRole("collaborator"),
    canEdit: hasMinRole("collaborator"),
    canManage: hasMinRole("admin"),
    hasMinRole,
  };
}
