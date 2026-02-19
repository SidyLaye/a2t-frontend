"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { quotesApi } from "@/lib/api/quotes";
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
import { LineItemEditor } from "@/components/shared/LineItemEditor";
import { Loader2 } from "lucide-react";

interface QuoteFormValues {
  client: string;
  issue_date: string;
  validity_date: string;
  notes: string;
  terms: string;
  lines: { description: string; quantity: string; unit: string; unit_price_ht: string; vat_rate: string }[];
}

export default function NewQuotePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const methods = useForm<QuoteFormValues>({
    defaultValues: {
      issue_date: new Date().toISOString().split("T")[0],
      validity_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      lines: [{ description: "", quantity: "1", unit: "unite", unit_price_ht: "", vat_rate: "20.00" }],
    },
  });

  const { data: clientsData } = useQuery({
    queryKey: queryKeys.clients.all(tid),
    queryFn: () => clientsApi.list({ page_size: 100 }),
    enabled: !!tid,
  });

  const mutation = useMutation({
    mutationFn: (data: QuoteFormValues) => quotesApi.create(data),
    onSuccess: () => { toast.success("Devis cree"); qc.invalidateQueries({ queryKey: queryKeys.quotes.all(tid) }); router.push("/quotes"); },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Nouveau devis" />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm">Informations</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select onValueChange={(v) => methods.setValue("client", v)}>
                  <SelectTrigger className="bg-background/50"><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                  <SelectContent>
                    {(clientsData?.results ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name || `${c.first_name} ${c.last_name}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div />
              <div><Label>Date d'emission</Label><Input type="date" {...methods.register("issue_date")} className="bg-background/50" /></div>
              <div><Label>Date de validite</Label><Input type="date" {...methods.register("validity_date")} className="bg-background/50" /></div>
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
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Creer le devis
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
