"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { expensesApi } from "@/lib/api/expenses";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: expense, isLoading } = useQuery({ queryKey: queryKeys.expenses.detail(tid, id), queryFn: () => expensesApi.get(id), enabled: !!tid });

  const validateMutation = useMutation({
    mutationFn: () => expensesApi.validate(id),
    onSuccess: () => { toast.success("Depense validee"); qc.invalidateQueries({ queryKey: queryKeys.expenses.all(tid) }); qc.invalidateQueries({ queryKey: queryKeys.expenses.detail(tid, id) }); },
    onError: () => toast.error("Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => expensesApi.delete(id),
    onSuccess: () => { toast.success("Depense supprimee"); qc.invalidateQueries({ queryKey: queryKeys.expenses.all(tid) }); router.push("/expenses"); },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!expense) return <p className="text-muted-foreground">Depense introuvable.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={expense.description}>
        <StatusBadge status={expense.status} />
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {expense.status === "pending" && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => validateMutation.mutate()}><CheckCircle className="h-4 w-4 mr-1" />Valider</Button>}
        <Button size="sm" variant="outline" className="text-red-400" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-1" />Supprimer</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Fournisseur</p><p className="font-medium">{expense.supplier_name || "—"}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{formatDate(expense.date)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Categorie</p><p className="font-medium">{expense.category_name || "—"}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Montant HT</p><p className="font-medium tabular-nums">{formatCurrency(expense.amount_ht)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">TVA ({expense.vat_rate}%)</p><p className="font-medium tabular-nums">{formatCurrency(expense.vat_amount)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Montant TTC</p><p className="font-medium tabular-nums text-indigo-400">{formatCurrency(expense.amount_ttc)}</p></CardContent></Card>
      </div>

      {expense.receipt_file && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Justificatif</p>
            <a href={expense.receipt_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline">
              <ExternalLink className="h-4 w-4" />Voir le justificatif
            </a>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer la depense ?" description="Cette action est irreversible." confirmLabel="Supprimer" variant="destructive" onConfirm={() => deleteMutation.mutate()} isLoading={deleteMutation.isPending} />
    </div>
  );
}
