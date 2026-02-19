"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { invoicesApi } from "@/lib/api/invoices";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

export default function InvoicePaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");

  const { data: invoice } = useQuery({ queryKey: queryKeys.invoices.detail(tid, id), queryFn: () => invoicesApi.get(id), enabled: !!tid });
  const { data: payments, isLoading } = useQuery({ queryKey: [...queryKeys.invoices.detail(tid, id), "payments"], queryFn: () => invoicesApi.getPayments(id), enabled: !!tid });

  const recordPayment = useMutation({
    mutationFn: () => invoicesApi.recordPayment(id, { amount, payment_method: method, reference }),
    onSuccess: () => {
      toast.success("Paiement enregistre");
      qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(tid, id) });
      setOpen(false);
      setAmount("");
      setReference("");
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={`Paiements - ${invoice?.invoice_number || ""}`}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Enregistrer un paiement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Montant *</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-background/50" /></div>
              <div>
                <Label>Methode</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Virement</SelectItem>
                    <SelectItem value="card">Carte</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                    <SelectItem value="cash">Especes</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Reference</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} className="bg-background/50" /></div>
              <Button onClick={() => recordPayment.mutate()} className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={!amount || recordPayment.isPending}>
                {recordPayment.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {invoice && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total TTC</p><p className="font-medium">{formatCurrency(invoice.total_ttc)}</p></CardContent></Card>
          <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Paye</p><p className="font-medium text-emerald-400">{formatCurrency(invoice.amount_paid)}</p></CardContent></Card>
          <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Reste du</p><p className="font-medium text-amber-400">{formatCurrency(invoice.amount_due)}</p></CardContent></Card>
        </div>
      )}

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Historique des paiements</CardTitle></CardHeader>
        <CardContent>
          {(payments ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun paiement enregistre.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Methode</TableHead><TableHead>Reference</TableHead><TableHead className="text-right">Montant</TableHead></TableRow></TableHeader>
              <TableBody>
                {(payments ?? []).map((p) => (
                  <TableRow key={p.id}><TableCell>{formatDate(p.payment_date)}</TableCell><TableCell className="capitalize">{p.payment_method.replace(/_/g, " ")}</TableCell><TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell><TableCell className="text-right font-medium">{formatCurrency(p.amount)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
