"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { entrepreneursApi } from "@/lib/api/entrepreneurs";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, ArrowRight, LogOut, Loader2, Zap } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";

export default function HubPage() {
  const router = useRouter();
  const { setActiveTenant } = useTenantStore();
  const { logout } = useAuth();
  const { entrepreneurRoles } = useAuthStore();

  const { data: companies, isLoading } = useQuery({
    queryKey: queryKeys.entrepreneurs.all(),
    queryFn: entrepreneursApi.list,
  });

  const handleSelect = (companyId: string) => {
    const company = companies?.results.find((c) => c.id === companyId);
    if (company) {
      setActiveTenant(companyId, company);
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Sélection du dossier</h1>
            <p className="text-muted-foreground text-lg">
              Choisissez l&apos;entreprise sur laquelle vous souhaitez travailler.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => logout()} className="gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
            {Object.values(entrepreneurRoles).some(role => role === "accountant" || role === "owner") && (
              <Button
                variant="outline"
                className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                onClick={() => router.push("/cabinet")}
              >
                <Zap className="h-4 w-4 fill-current" />
                Management Cabinet
              </Button>
            )}
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => router.push("/register-company")}>
              <Plus className="h-4 w-4" />
              Nouveau dossier
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.results.map((company) => {
            const role = entrepreneurRoles[company.id] || "client";
            return (
              <Card
                key={company.id}
                className="group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => handleSelect(company.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {role}
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-xl">{company.company_name}</CardTitle>
                  <CardDescription className="line-clamp-1">{company.city}, {company.country}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Ouvrir le dossier
                  </span>
                  <ArrowRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400 transform translate-x-0 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            );
          })}

          {companies?.results.length === 0 && (
            <div className="col-span-full py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Aucun dossier trouvé</h3>
                <p className="text-muted-foreground">Vous n&apos;avez pas encore accès à un dossier client.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
