"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { bankingApi } from "@/lib/api/banking";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { type BankTransaction } from "@/types/banking";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

const columns: ColumnDef<BankTransaction, unknown>[] = [
  { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.date)}</span> },
  { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="font-medium">{row.original.description}</span> },
  { accessorKey: "amount", header: "Montant", cell: ({ row }) => {
    const amount = parseFloat(row.original.amount);
    return <span className={cn("tabular-nums font-medium", amount >= 0 ? "text-emerald-400" : "text-red-400")}>{formatCurrency(row.original.amount)}</span>;
  }},
  { accessorKey: "match_status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.match_status} /> },
];

const statusTabs = [
  { value: "", label: "Toutes" },
  { value: "unmatched", label: "Non rapprochees" },
  { value: "auto_matched", label: "Auto" },
  { value: "manually_matched", label: "Manuelles" },
  { value: "ignored", label: "Ignorees" },
];

export default function TransactionsPage() {
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [matchStatus, setMatchStatus] = useState("");

  const params = matchStatus ? { match_status: matchStatus } : {};
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.banking.transactions(tid, params),
    queryFn: () => bankingApi.listTransactions(params),
    enabled: !!tid,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions bancaires" />
      <Tabs value={matchStatus} onValueChange={setMatchStatus}>
        <TabsList className="bg-muted/50">{statusTabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}</TabsList>
      </Tabs>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} emptyTitle="Aucune transaction" />
    </div>
  );
}
