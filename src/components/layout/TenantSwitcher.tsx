"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function TenantSwitcher() {
  const { entrepreneurRoles } = useAuthStore();
  const { activeEntrepreneurId, setActiveTenant } = useTenantStore();
  const queryClient = useQueryClient();

  const tenantIds = Object.keys(entrepreneurRoles);

  if (tenantIds.length <= 1) return null;

  const handleSwitch = (id: string) => {
    setActiveTenant(id);
    queryClient.invalidateQueries();
  };

  return (
    <Select value={activeEntrepreneurId ?? undefined} onValueChange={handleSwitch}>
      <SelectTrigger className="bg-white/5 border-white/10 text-sm h-9">
        <Building2 className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Choisir une entreprise" />
      </SelectTrigger>
      <SelectContent>
        {tenantIds.map((id) => (
          <SelectItem key={id} value={id}>
            {id.slice(0, 8)}... ({entrepreneurRoles[id]})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
