"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { vatApi } from "@/lib/api/vat";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { type VATDeclaration, type VATPeriodType } from "@/types/vat";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const columns: ColumnDef<VATDeclaration, unknown>[] = [
  { accessorKey: "period_type", header: "Periode", cell: ({ row }) => <span className="capitalize font-medium">{row.original.period_type === "monthly" ? "Mensuelle" : row.original.period_type === "quarterly" ? "Trimestrielle" : "Annuelle"}</span> },
  { accessorKey: "period_start", header: "Debut", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.period_start)}</span> },
  { accessorKey: "period_end", header: "Fin", cell: ({ row }) => <span className="text-muted-foreground">{formatDateShort(row.original.period_end)}</span> },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "total_vat_collected", header: "TVA collectee", cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.total_vat_collected)}</span> },
  { accessorKey: "total_vat_deductible", header: "TVA deductible", cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.total_vat_deductible)}</span> },
  { accessorKey: "vat_balance", header: "Solde", cell: ({ row }) => {
    const balance = parseFloat(row.original.vat_balance);
    return <span className={cn("tabular-nums font-medium", balance > 0 ? "text-red-400" : "text-emerald-400")}>{formatCurrency(row.original.vat_balance)}</span>;
  }},
];

const statusTabs = [
  { value: "", label: "Toutes" },
  { value: "draft", label: "Brouillons" },
  { value: "calculated", label: "Calculees" },
  { value: "reviewed", label: "Revues" },
  { value: "submitted", label: "Soumises" },
];

export default function VATPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<{ period_type: VATPeriodType; period_start: string; period_end: string }>({ period_type: "monthly", period_start: "", period_end: "" });

  const params = status ? { status } : {};
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.vat.list(tid, params),
    queryFn: () => vatApi.list(params),
    enabled: !!tid,
  });

  const createMutation = useMutation({
    mutationFn: () => vatApi.create(formData),
    onSuccess: () => { toast.success("Declaration creee"); qc.invalidateQueries({ queryKey: queryKeys.vat.all(tid) }); setOpen(false); },
    onError: () => toast.error("Erreur"),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="TVA" description="Declarations de TVA">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Nouvelle declaration</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle declaration TVA</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type de periode</Label>
                <Select value={formData.period_type} onValueChange={(v) => setFormData({ ...formData, period_type: v as VATPeriodType })}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuelle</SelectItem>
                    <SelectItem value="quarterly">Trimestrielle</SelectItem>
                    <SelectItem value="yearly">Annuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date debut</Label><Input type="date" value={formData.period_start} onChange={(e) => setFormData({ ...formData, period_start: e.target.value })} className="bg-background/50" /></div>
              <div><Label>Date fin</Label><Input type="date" value={formData.period_end} onChange={(e) => setFormData({ ...formData, period_end: e.target.value })} className="bg-background/50" /></div>
              <Button onClick={() => createMutation.mutate()} className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={!formData.period_start || !formData.period_end || createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Creer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="bg-muted/50">{statusTabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}</TabsList>
      </Tabs>
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} emptyTitle="Aucune declaration TVA" onRowClick={(d) => router.push(`/vat/${d.id}`)} />
    </div>
  );
}
