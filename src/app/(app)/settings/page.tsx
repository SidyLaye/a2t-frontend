"use client";

import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { entrepreneursApi } from "@/lib/api/entrepreneurs";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { EntrepreneurCreate } from "@/types/entrepreneur";

export default function SettingsPage() {
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data: company, isLoading } = useQuery({
    queryKey: queryKeys.entrepreneurs.detail(tid),
    queryFn: () => entrepreneursApi.get(tid),
    enabled: !!tid,
  });

  const { register, handleSubmit } = useForm<EntrepreneurCreate>({ values: company as EntrepreneurCreate | undefined });

  const mutation = useMutation({
    mutationFn: (data: Partial<EntrepreneurCreate>) => entrepreneursApi.update(tid, data),
    onSuccess: () => { toast.success("Entreprise mise a jour"); qc.invalidateQueries({ queryKey: queryKeys.entrepreneurs.all() }); },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Reglages" description="Informations de votre entreprise" />
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Entreprise</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Raison sociale</Label><Input {...register("company_name")} className="bg-background/50" /></div>
              <div><Label>SIREN</Label><Input {...register("siren")} className="bg-background/50" /></div>
              <div><Label>Numero TVA</Label><Input {...register("vat_number")} className="bg-background/50" /></div>
              <div><Label>Email</Label><Input type="email" {...register("email")} className="bg-background/50" /></div>
              <div><Label>Telephone</Label><Input {...register("phone")} className="bg-background/50" /></div>
            </div>
            <div><Label>Adresse</Label><Input {...register("address_line1")} className="bg-background/50" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Code postal</Label><Input {...register("postal_code")} className="bg-background/50" /></div>
              <div><Label>Ville</Label><Input {...register("city")} className="bg-background/50" /></div>
              <div><Label>Pays</Label><Input {...register("country")} className="bg-background/50" /></div>
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
