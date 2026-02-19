"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { expensesApi } from "@/lib/api/expenses";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import type { ExpenseCreate } from "@/types/expense";

export default function NewExpensePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { register, handleSubmit, setValue, watch } = useForm<ExpenseCreate>({
    defaultValues: { date: new Date().toISOString().split("T")[0], vat_rate: "20.00", is_vat_deductible: true },
  });

  const { data: categoriesData } = useQuery({
    queryKey: [...queryKeys.expenses.all(tid), "categories"],
    queryFn: () => expensesApi.listCategories(),
    enabled: !!tid,
  });

  const mutation = useMutation({
    mutationFn: (data: ExpenseCreate) => expensesApi.create(data),
    onSuccess: () => { toast.success("Depense creee"); qc.invalidateQueries({ queryKey: queryKeys.expenses.all(tid) }); router.push("/expenses"); },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => expensesApi.uploadReceipt(file),
    onSuccess: (expense) => {
      toast.success("Justificatif analyse par OCR");
      setValue("description", expense.description);
      setValue("amount_ht", expense.amount_ht);
      setValue("vat_amount", expense.vat_amount);
      setValue("amount_ttc", expense.amount_ttc);
      if (expense.supplier_name) setValue("supplier_name", expense.supplier_name);
      if (expense.date) setValue("date", expense.date);
    },
    onError: () => toast.error("Erreur lors de l'upload"),
  });

  const onDrop = useCallback((files: File[]) => { if (files[0]) uploadMutation.mutate(files[0]); }, [uploadMutation]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [], "application/pdf": [] }, maxFiles: 1 });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouvelle depense" />

      {/* Receipt upload */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Justificatif (optionnel)</CardTitle></CardHeader>
        <CardContent>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-border/60 hover:border-indigo-500/50"}`}>
            <input {...getInputProps()} />
            {uploadMutation.isPending ? (
              <div className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Analyse OCR en cours...</span></div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Glissez un justificatif ou cliquez pour importer</p>
                <p className="text-xs text-muted-foreground">Image ou PDF — les champs seront pre-remplis par OCR</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div><Label>Description *</Label><Input {...register("description")} className="bg-background/50" /></div>
            <div><Label>Fournisseur</Label><Input {...register("supplier_name")} className="bg-background/50" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Montant HT *</Label><Input type="number" step="0.01" {...register("amount_ht")} className="bg-background/50" /></div>
              <div><Label>TVA *</Label><Input type="number" step="0.01" {...register("vat_amount")} className="bg-background/50" /></div>
              <div><Label>Montant TTC *</Label><Input type="number" step="0.01" {...register("amount_ttc")} className="bg-background/50" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Date *</Label><Input type="date" {...register("date")} className="bg-background/50" /></div>
              <div>
                <Label>Categorie</Label>
                <Select onValueChange={(v) => setValue("category", v)} value={watch("category") || ""}>
                  <SelectTrigger className="bg-background/50"><SelectValue placeholder="Choisir une categorie" /></SelectTrigger>
                  <SelectContent>
                    {(categoriesData?.results ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Creer la depense
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
