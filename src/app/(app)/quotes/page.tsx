"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { quotesApi } from "@/lib/api/quotes";
import { queryKeys } from "@/lib/query/keys";
import { type ColumnDef } from "@tanstack/react-table";
import { type Quote } from "@/types/quote";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { Plus } from "lucide-react";

const columns: ColumnDef<Quote, unknown>[] = [
  { accessorKey: "quote_number", header: "N°", cell: ({ row }) => <span className="font-medium">{row.original.quote_number || "Brouillon"}</span> },
  { accessorKey: "client_name", header: "Client" },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "total_ttc", header: "Montant TTC", cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.total_ttc)}</span> },
  { accessorKey: "issue_date", header: "Date", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.issue_date)}</span> },
];

const statusTabs = [
  { value: "", label: "Tous" },
  { value: "draft", label: "Brouillons" },
  { value: "sent", label: "Envoyes" },
  { value: "accepted", label: "Acceptes" },
  { value: "refused", label: "Refuses" },
];

export default function QuotesPage() {
  const router = useRouter();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [status, setStatus] = useState("");

  const params = status ? { status } : {};
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.quotes.list(tid, params),
    queryFn: () => quotesApi.list(params),
    enabled: !!tid,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Devis" description="Gestion de vos devis">
        <Link href="/quotes/new"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Nouveau devis</Button></Link>
      </PageHeader>
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="bg-muted/50">
          {statusTabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} emptyTitle="Aucun devis" onRowClick={(q) => router.push(`/quotes/${q.id}`)} />
    </div>
  );
}
