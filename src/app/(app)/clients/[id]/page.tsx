"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { clientsApi } from "@/lib/api/clients";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pencil, Trash2, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { useState } from "react";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: queryKeys.clients.detail(tid, id),
    queryFn: () => clientsApi.get(id),
    enabled: !!tid,
  });

  const deleteMut = useMutation({
    mutationFn: () => clientsApi.delete(id),
    onSuccess: () => { toast.success("Client supprime"); qc.invalidateQueries({ queryKey: queryKeys.clients.all(tid) }); router.push("/clients"); },
  });

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  if (!client) return <p className="text-muted-foreground">Client introuvable.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={client.company_name || `${client.first_name} ${client.last_name}`}>
        <Link href={`/clients/${id}/edit`}><Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" />Modifier</Button></Link>
        <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-1" />Supprimer</Button>
      </PageHeader>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm text-muted-foreground">Informations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {client.company_name && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span>{client.company_name} {client.siren && `(SIREN: ${client.siren})`}</span></div>}
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{client.email}</span></div>
          {client.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{client.phone}</span></div>}
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{client.address_line1}, {client.postal_code} {client.city}</span></div>
        </CardContent>
      </Card>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer ce client ?" description="Cette action est irreversible." confirmLabel="Supprimer" onConfirm={() => deleteMut.mutate()} variant="destructive" isLoading={deleteMut.isPending} />
    </div>
  );
}
