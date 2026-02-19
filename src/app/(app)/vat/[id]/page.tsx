"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { vatApi } from "@/lib/api/vat";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Eye, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function VATDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [actionDialog, setActionDialog] = useState<{ action: string; title: string; desc: string } | null>(null);

  const { data: declaration, isLoading } = useQuery({ queryKey: queryKeys.vat.detail(tid, id), queryFn: () => vatApi.get(id), enabled: !!tid });

  const doAction = useMutation({
    mutationFn: async (action: string) => {
      if (action === "calculate") return vatApi.calculate(id);
      if (action === "review") return vatApi.review(id);
      if (action === "submit") return vatApi.submit(id);
    },
    onSuccess: () => { toast.success("Declaration mise a jour"); qc.invalidateQueries({ queryKey: queryKeys.vat.all(tid) }); qc.invalidateQueries({ queryKey: queryKeys.vat.detail(tid, id) }); },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!declaration) return <p className="text-muted-foreground">Declaration introuvable.</p>;

  const balance = parseFloat(declaration.vat_balance);
  const periodLabel = declaration.period_type === "monthly" ? "Mensuelle" : declaration.period_type === "quarterly" ? "Trimestrielle" : "Annuelle";

  const vatRates = [
    { rate: "20%", collected: declaration.vat_collected_20, deductible: declaration.vat_deductible_20 },
    { rate: "10%", collected: declaration.vat_collected_10, deductible: declaration.vat_deductible_10 },
    { rate: "5,5%", collected: declaration.vat_collected_5_5, deductible: declaration.vat_deductible_5_5 },
    { rate: "2,1%", collected: declaration.vat_collected_2_1, deductible: declaration.vat_deductible_2_1 },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={`Declaration TVA ${periodLabel}`}>
        <StatusBadge status={declaration.status} />
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {declaration.status === "draft" && <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setActionDialog({ action: "calculate", title: "Calculer la TVA ?", desc: "Les montants seront calcules a partir des factures et depenses." })}><Calculator className="h-4 w-4 mr-1" />Calculer</Button>}
        {declaration.status === "calculated" && <Button size="sm" variant="outline" onClick={() => setActionDialog({ action: "review", title: "Marquer comme revue ?", desc: "La declaration sera marquee comme verifiee." })}><Eye className="h-4 w-4 mr-1" />Valider la revue</Button>}
        {declaration.status === "reviewed" && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setActionDialog({ action: "submit", title: "Soumettre la declaration ?", desc: "La declaration sera soumise definitivement." })}><Send className="h-4 w-4 mr-1" />Soumettre</Button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Periode</p><p className="font-medium">{formatDate(declaration.period_start)} — {formatDate(declaration.period_end)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">TVA collectee</p><p className="font-medium tabular-nums">{formatCurrency(declaration.total_vat_collected)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">TVA deductible</p><p className="font-medium tabular-nums">{formatCurrency(declaration.total_vat_deductible)}</p></CardContent></Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Detail par taux</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Taux</TableHead><TableHead className="text-right">Collectee</TableHead><TableHead className="text-right">Deductible</TableHead><TableHead className="text-right">Difference</TableHead></TableRow></TableHeader>
            <TableBody>
              {vatRates.map((r) => {
                const diff = parseFloat(r.collected) - parseFloat(r.deductible);
                return (
                  <TableRow key={r.rate}>
                    <TableCell className="font-medium">{r.rate}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.collected)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(r.deductible)}</TableCell>
                    <TableCell className={cn("text-right tabular-nums font-medium", diff > 0 ? "text-red-400" : "text-emerald-400")}>{formatCurrency(diff)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-end gap-8 text-base font-semibold">
            <span>Solde TVA</span>
            <span className={cn("tabular-nums", balance > 0 ? "text-red-400" : "text-emerald-400")}>{formatCurrency(declaration.vat_balance)}</span>
          </div>
        </CardContent>
      </Card>

      {actionDialog && <ConfirmDialog open onOpenChange={() => setActionDialog(null)} title={actionDialog.title} description={actionDialog.desc} confirmLabel="Confirmer" onConfirm={() => { doAction.mutate(actionDialog.action); setActionDialog(null); }} isLoading={doAction.isPending} />}
    </div>
  );
}
