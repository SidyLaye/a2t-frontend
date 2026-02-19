"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { clientsApi } from "@/lib/api/clients";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { ClientCreate } from "@/types/client";

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data: client, isLoading } = useQuery({
    queryKey: queryKeys.clients.detail(tid, id),
    queryFn: () => clientsApi.get(id),
    enabled: !!tid,
  });

  const { register, handleSubmit } = useForm<ClientCreate>({ values: client as ClientCreate | undefined });

  const mutation = useMutation({
    mutationFn: (data: Partial<ClientCreate>) => clientsApi.update(id, data),
    onSuccess: () => { toast.success("Client mis a jour"); qc.invalidateQueries({ queryKey: queryKeys.clients.all(tid) }); router.push(`/clients/${id}`); },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Modifier le client" />
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Entreprise</Label><Input {...register("company_name")} className="bg-background/50" /></div>
              <div><Label>SIREN</Label><Input {...register("siren")} className="bg-background/50" /></div>
              <div><Label>Prenom</Label><Input {...register("first_name")} className="bg-background/50" /></div>
              <div><Label>Nom</Label><Input {...register("last_name")} className="bg-background/50" /></div>
              <div><Label>Email</Label><Input type="email" {...register("email")} className="bg-background/50" /></div>
              <div><Label>Telephone</Label><Input {...register("phone")} className="bg-background/50" /></div>
            </div>
            <div><Label>Adresse</Label><Input {...register("address_line1")} className="bg-background/50" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Code postal</Label><Input {...register("postal_code")} className="bg-background/50" /></div>
              <div><Label>Ville</Label><Input {...register("city")} className="bg-background/50" /></div>
              <div><Label>Pays</Label><Input {...register("country")} className="bg-background/50" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enregistrer
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
