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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BankingMatchingDialog } from "@/components/banking/BankingMatchingDialog";
import { Link as LucideLink } from "lucide-react";

const statusTabs = [
  { value: "", label: "Toutes" },
  { value: "unmatched", label: "Non rapprochees" },
  { value: "auto_matched", label: "Auto" },
  { value: "manually_matched", label: "Manuelles" },
  { value: "ignored", label: "Ignorees" },
];

export default function TransactionsPage() {
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [matchStatus, setMatchStatus] = useState("unmatched");
  const [selectedTxn, setSelectedTxn] = useState<BankTransaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: ColumnDef<BankTransaction, unknown>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.date)}</span> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="font-medium">{row.original.description}</span> },
    {
      accessorKey: "amount", header: "Montant", cell: ({ row }) => {
        const amount = parseFloat(row.original.amount);
        return <span className={cn("tabular-nums font-medium", amount >= 0 ? "text-emerald-500" : "text-red-500")}>{formatCurrency(row.original.amount)}</span>;
      }
    },
    { accessorKey: "match_status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.match_status} /> },
    {
      id: "actions", cell: ({ row }) => {
        const isUnmatched = row.original.match_status === "unmatched";
        return (
          <div className="flex justify-end">
            {isUnmatched ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600"
                onClick={() => {
                  setSelectedTxn(row.original);
                  setDialogOpen(true);
                }}
              >
                <LucideLink className="h-3.5 w-3.5" />
                Rapprocher
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground italic px-2">Rapproché</span>
            )}
          </div>
        );
      }
    },
  ];

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
        <TabsList className="bg-muted/50">
          {statusTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataTable
        columns={columns}
        data={data?.results ?? []}
        isLoading={isLoading}
        emptyTitle="Aucune transaction"
      />

      <BankingMatchingDialog
        transaction={selectedTxn}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
