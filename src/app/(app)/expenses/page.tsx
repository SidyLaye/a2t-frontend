"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { expensesApi } from "@/lib/api/expenses";
import { queryKeys } from "@/lib/query/keys";
import { type ColumnDef } from "@tanstack/react-table";
import { type Expense } from "@/types/expense";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { Plus, Receipt } from "lucide-react";

const columns: ColumnDef<Expense, unknown>[] = [
  { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.date)}</span> },
  { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="font-medium">{row.original.description}</span> },
  { accessorKey: "supplier_name", header: "Fournisseur", cell: ({ row }) => <span className="text-muted-foreground">{row.original.supplier_name || "—"}</span> },
  { accessorKey: "category_name", header: "Categorie", cell: ({ row }) => <span className="text-muted-foreground">{row.original.category_name || "—"}</span> },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "amount_ttc", header: "Montant TTC", cell: ({ row }) => <span className="tabular-nums font-medium">{formatCurrency(row.original.amount_ttc)}</span> },
  { id: "receipt", header: "", cell: ({ row }) => row.original.receipt_file ? <Receipt className="h-4 w-4 text-muted-foreground" /> : null },
];

const statusTabs = [
  { value: "", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "categorized", label: "Categorisees" },
  { value: "validated", label: "Validees" },
  { value: "rejected", label: "Rejetees" },
];

export default function ExpensesPage() {
  const router = useRouter();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [status, setStatus] = useState("");

  const params = status ? { status } : {};
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.expenses.list(tid, params),
    queryFn: () => expensesApi.list(params),
    enabled: !!tid,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Depenses" description="Suivi de vos depenses professionnelles">
        <Link href="/expenses/new"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Nouvelle depense</Button></Link>
      </PageHeader>
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="bg-muted/50">{statusTabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}</TabsList>
      </Tabs>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} emptyTitle="Aucune depense" onRowClick={(e) => router.push(`/expenses/${e.id}`)} />
    </div>
  );
}
