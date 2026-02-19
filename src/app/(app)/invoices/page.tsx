"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { invoicesApi } from "@/lib/api/invoices";
import { queryKeys } from "@/lib/query/keys";
import { type ColumnDef } from "@tanstack/react-table";
import { type Invoice } from "@/types/invoice";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const columns: ColumnDef<Invoice, unknown>[] = [
  { accessorKey: "invoice_number", header: "N°", cell: ({ row }) => <span className="font-medium">{row.original.invoice_number || "Brouillon"}</span> },
  { accessorKey: "client_name", header: "Client" },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "total_ttc", header: "Total TTC", cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.total_ttc)}</span> },
  { accessorKey: "amount_due", header: "Reste du", cell: ({ row }) => <span className={cn("tabular-nums", parseFloat(row.original.amount_due) > 0 && "text-amber-400")}>{formatCurrency(row.original.amount_due)}</span> },
  { accessorKey: "due_date", header: "Echeance", cell: ({ row }) => {
    const overdue = row.original.status === "overdue";
    return <span className={cn("text-muted-foreground", overdue && "text-red-400 font-medium")}>{formatDateShort(row.original.due_date)}</span>;
  }},
];

const statusTabs = [
  { value: "", label: "Toutes" },
  { value: "draft", label: "Brouillons" },
  { value: "validated", label: "Validees" },
  { value: "sent", label: "Envoyees" },
  { value: "paid", label: "Payees" },
  { value: "overdue", label: "En retard" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [status, setStatus] = useState("");

  const params = status ? { status } : {};
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.invoices.list(tid, params),
    queryFn: () => invoicesApi.list(params),
    enabled: !!tid,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Factures" description="Gestion de vos factures">
        <Link href="/invoices/new"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Nouvelle facture</Button></Link>
      </PageHeader>
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="bg-muted/50">{statusTabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}</TabsList>
      </Tabs>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} emptyTitle="Aucune facture" onRowClick={(inv) => router.push(`/invoices/${inv.id}`)} />
    </div>
  );
}
