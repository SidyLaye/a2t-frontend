"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/keys";
import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/types/auth";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDateShort } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

const columns: ColumnDef<User, unknown>[] = [
  { id: "name", header: "Nom", cell: ({ row }) => <span className="font-medium">{`${row.original.first_name} ${row.original.last_name}`.trim() || "—"}</span> },
  { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span> },
  { accessorKey: "is_staff", header: "Role", cell: ({ row }) => <span className={cn("text-xs px-2 py-1 rounded", row.original.is_staff ? "bg-indigo-500/10 text-indigo-400" : "bg-muted/50")}>{row.original.is_staff ? "Admin" : "Utilisateur"}</span> },
  { accessorKey: "is_active", header: "Statut", cell: ({ row }) => <span className={cn("text-xs px-2 py-1 rounded", row.original.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>{row.original.is_active ? "Actif" : "Inactif"}</span> },
  { accessorKey: "date_joined", header: "Inscrit le", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.date_joined)}</span> },
  { accessorKey: "last_login", header: "Derniere connexion", cell: ({ row }) => <span className="text-muted-foreground">{row.original.last_login ? formatDateShort(row.original.last_login) : "Jamais"}</span> },
];

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: () => adminApi.users(),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Utilisateurs" description="Gestion des utilisateurs de la plateforme" />
      <DataTable columns={columns} data={(data?.results ?? []) as User[]} isLoading={isLoading} emptyTitle="Aucun utilisateur" />
    </div>
  );
}
