"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { clientsApi } from "@/lib/api/clients";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { ClientCreate } from "@/types/client";

export default function NewClientPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const { register, handleSubmit, formState: { errors } } = useForm<ClientCreate>();

  const mutation = useMutation({
    mutationFn: (data: ClientCreate) => clientsApi.create(data),
    onSuccess: () => {
      toast.success("Client cree avec succes");
      qc.invalidateQueries({ queryKey: queryKeys.clients.all(tid) });
      router.push("/clients");
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouveau client" />
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Entreprise</Label><Input {...register("company_name")} className="bg-background/50" /></div>
              <div><Label>SIREN</Label><Input {...register("siren")} className="bg-background/50" /></div>
              <div><Label>Prenom *</Label><Input {...register("first_name", { required: true })} className="bg-background/50" /></div>
              <div><Label>Nom *</Label><Input {...register("last_name", { required: true })} className="bg-background/50" /></div>
              <div><Label>Email *</Label><Input type="email" {...register("email", { required: true })} className="bg-background/50" /></div>
              <div><Label>Telephone</Label><Input {...register("phone")} className="bg-background/50" /></div>
            </div>
            <div><Label>Adresse *</Label><Input {...register("address_line1", { required: true })} className="bg-background/50" /></div>
            <div><Label>Complement</Label><Input {...register("address_line2")} className="bg-background/50" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Code postal *</Label><Input {...register("postal_code", { required: true })} className="bg-background/50" /></div>
              <div><Label>Ville *</Label><Input {...register("city", { required: true })} className="bg-background/50" /></div>
              <div><Label>Pays</Label><Input {...register("country")} defaultValue="FR" className="bg-background/50" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Creer le client
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
