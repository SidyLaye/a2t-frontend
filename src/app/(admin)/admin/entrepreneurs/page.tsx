"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { type AdminEntrepreneur } from "@/types/dashboard";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateShort } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

const columns: ColumnDef<AdminEntrepreneur, unknown>[] = [
  { accessorKey: "company_name", header: "Entreprise", cell: ({ row }) => <span className="font-medium">{row.original.company_name}</span> },
  { accessorKey: "siren", header: "SIREN" },
  { accessorKey: "owner_email", header: "Proprietaire", cell: ({ row }) => <span className="text-muted-foreground">{row.original.owner_email}</span> },
  { accessorKey: "members_count", header: "Membres", cell: ({ row }) => <span className="tabular-nums">{row.original.members_count}</span> },
  { accessorKey: "is_active", header: "Statut", cell: ({ row }) => <span className={cn("text-xs px-2 py-1 rounded", row.original.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>{row.original.is_active ? "Actif" : "Inactif"}</span> },
  { accessorKey: "created_at", header: "Cree le", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.created_at)}</span> },
];

export default function AdminEntrepreneursPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.entrepreneurs(),
    queryFn: () => adminApi.entrepreneurs(),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleEntrepreneur(id),
    onSuccess: () => { toast.success("Statut mis a jour"); qc.invalidateQueries({ queryKey: queryKeys.admin.entrepreneurs() }); },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Entrepreneurs" description="Gestion des entreprises de la plateforme" />
      <DataTable columns={columns} data={(data?.results ?? []) as AdminEntrepreneur[]} isLoading={isLoading} emptyTitle="Aucun entrepreneur" />
    </div>
  );
}
