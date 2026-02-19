"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { clientsApi } from "@/lib/api/clients";
import { queryKeys } from "@/lib/query/keys";
import { type ColumnDef } from "@tanstack/react-table";
import { type Client } from "@/types/client";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateShort } from "@/lib/utils/formatters";
import { Plus, Search } from "lucide-react";

const columns: ColumnDef<Client, unknown>[] = [
  {
    accessorKey: "company_name",
    header: "Entreprise",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.company_name || "—"}</span>
    ),
  },
  {
    id: "name",
    header: "Contact",
    cell: ({ row }) => (
      <span>{`${row.original.first_name} ${row.original.last_name}`.trim() || "—"}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "city",
    header: "Ville",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.city || "—"}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Créé le",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDateShort(row.original.created_at)}</span>
    ),
  },
];

export default function ClientsPage() {
  const router = useRouter();
  const { activeEntrepreneurId } = useTenantStore();
  const tid = activeEntrepreneurId ?? "";
  const [search, setSearch] = useState("");

  const params = { search };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.clients.list(tid, params),
    queryFn: () => clientsApi.list(params),
    enabled: !!tid,
  });

  const clients = data?.results ?? [];

  if (!tid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Selectionnez une entreprise pour continuer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Gestion de votre portefeuille clients">
        <Link href="/clients/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500">
            <Plus className="h-4 w-4 mr-1" /> Nouveau client
          </Button>
        </Link>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/50 border-border/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={clients}
        isLoading={isLoading}
        emptyTitle="Aucun client"
        emptyDescription="Commencez par ajouter votre premier client."
        onRowClick={(client) => router.push(`/clients/${client.id}`)}
      />
    </div>
  );
}
