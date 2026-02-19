"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/keys";
import { type ColumnDef } from "@tanstack/react-table";
import { type Subscription } from "@/types/payment";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateShort } from "@/lib/utils/formatters";

const columns: ColumnDef<Subscription, unknown>[] = [
  { accessorKey: "plan_name", header: "Plan", cell: ({ row }) => <span className="capitalize font-medium">{row.original.plan_name}</span> },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "current_period_start", header: "Debut", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.current_period_start)}</span> },
  { accessorKey: "current_period_end", header: "Fin", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.current_period_end)}</span> },
];

export default function AdminSubscriptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.subscriptions(),
    queryFn: () => adminApi.subscriptions(),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Abonnements" description="Suivi des abonnements de la plateforme" />
      <DataTable columns={columns} data={(data?.results ?? []) as Subscription[]} isLoading={isLoading} emptyTitle="Aucun abonnement" />
    </div>
  );
}
