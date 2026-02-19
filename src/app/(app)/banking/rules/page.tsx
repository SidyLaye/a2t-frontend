"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { bankingApi } from "@/lib/api/banking";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function MatchingRulesPage() {
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description_contains: "", auto_create_expense: false });

  const { data: rulesData, isLoading } = useQuery({
    queryKey: queryKeys.banking.rules(tid),
    queryFn: () => bankingApi.listRules(),
    enabled: !!tid,
  });

  const createMutation = useMutation({
    mutationFn: () => bankingApi.createRule(formData),
    onSuccess: () => { toast.success("Regle creee"); qc.invalidateQueries({ queryKey: queryKeys.banking.rules(tid) }); setOpen(false); setFormData({ name: "", description_contains: "", auto_create_expense: false }); },
    onError: () => toast.error("Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bankingApi.deleteRule(id),
    onSuccess: () => { toast.success("Regle supprimee"); qc.invalidateQueries({ queryKey: queryKeys.banking.rules(tid) }); setDeleteId(null); },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  const rules = rulesData?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Regles de rapprochement">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Nouvelle regle</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle regle</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-background/50" /></div>
              <div><Label>Description contient *</Label><Input value={formData.description_contains} onChange={(e) => setFormData({ ...formData, description_contains: e.target.value })} className="bg-background/50" /></div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.auto_create_expense} onCheckedChange={(v) => setFormData({ ...formData, auto_create_expense: v })} />
                <Label>Creer une depense automatiquement</Label>
              </div>
              <Button onClick={() => createMutation.mutate()} className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={!formData.name || createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Creer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {rules.length === 0 ? (
        <Card className="bg-card/50 border-border/50"><CardContent className="py-12 text-center"><p className="text-muted-foreground">Aucune regle de rapprochement.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">Contient: &quot;{rule.description_contains}&quot; {rule.auto_create_expense && "• Auto-depense"}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => setDeleteId(rule.id)}><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {deleteId && <ConfirmDialog open onOpenChange={() => setDeleteId(null)} title="Supprimer cette regle ?" description="Cette action est irreversible." confirmLabel="Supprimer" variant="destructive" onConfirm={() => deleteMutation.mutate(deleteId)} isLoading={deleteMutation.isPending} />}
    </div>
  );
}
