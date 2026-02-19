"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { LineItemEditor } from "@/components/shared/LineItemEditor";
import { Loader2 } from "lucide-react";

interface InvoiceFormValues {
  client: string;
  issue_date: string;
  due_date: string;
  notes: string;
  terms: string;
  lines: { description: string; quantity: string; unit: string; unit_price_ht: string; vat_rate: string }[];
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data: invoice, isLoading } = useQuery({
    queryKey: queryKeys.invoices.detail(tid, id),
    queryFn: () => invoicesApi.get(id),
    enabled: !!tid,
  });

  const { data: clientsData } = useQuery({
    queryKey: queryKeys.clients.all(tid),
    queryFn: () => clientsApi.list({ page_size: 100 }),
    enabled: !!tid,
  });

  const methods = useForm<InvoiceFormValues>({
    values: invoice ? {
      client: invoice.client,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      notes: invoice.notes,
      terms: invoice.terms,
      lines: invoice.lines.map((l) => ({ description: l.description, quantity: l.quantity, unit: l.unit, unit_price_ht: l.unit_price_ht, vat_rate: l.vat_rate })),
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: InvoiceFormValues) => invoicesApi.update(id, data),
    onSuccess: () => { toast.success("Facture mise a jour"); qc.invalidateQueries({ queryKey: queryKeys.invoices.all(tid) }); router.push(`/invoices/${id}`); },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Modifier la facture" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm">Informations</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select onValueChange={(v) => methods.setValue("client", v)} value={methods.watch("client")}>
                  <SelectTrigger className="bg-background/50"><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                  <SelectContent>
                    {(clientsData?.results ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name || `${c.first_name} ${c.last_name}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div />
              <div><Label>Date d&apos;emission</Label><Input type="date" {...methods.register("issue_date")} className="bg-background/50" /></div>
              <div><Label>Date d&apos;echeance</Label><Input type="date" {...methods.register("due_date")} className="bg-background/50" /></div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm">Lignes</CardTitle></CardHeader>
            <CardContent><LineItemEditor name="lines" /></CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Notes</Label><Textarea {...methods.register("notes")} className="bg-background/50" rows={3} /></div>
              <div><Label>Conditions</Label><Textarea {...methods.register("terms")} className="bg-background/50" rows={3} /></div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enregistrer
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
