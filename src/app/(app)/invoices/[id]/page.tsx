"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { invoicesApi } from "@/lib/api/invoices";
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
import { cn } from "@/lib/utils";
import { Send, CheckCircle, FileText, ExternalLink, Undo2, Pencil, CreditCard } from "lucide-react";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [actionDialog, setActionDialog] = useState<{ action: string; title: string; desc: string } | null>(null);

  const { data: invoice, isLoading } = useQuery({ queryKey: queryKeys.invoices.detail(tid, id), queryFn: () => invoicesApi.get(id), enabled: !!tid });

  const doAction = useMutation({
    mutationFn: async (action: string) => {
      if (action === "validate") return invoicesApi.validate(id);
      if (action === "send") return invoicesApi.send(id);
      if (action === "pdf") {
        const blob = await invoicesApi.getPDF(id);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        return;
      }
      if (action === "payment_link") {
        const res = await invoicesApi.createPaymentLink(id);
        await navigator.clipboard.writeText(res.stripe_payment_link);
        toast.success("Lien de paiement copie !");
        return;
      }
      if (action === "credit_note") return invoicesApi.createCreditNote(id, "Avoir");
    },
    onSuccess: (_, action) => {
      if (action !== "pdf" && action !== "payment_link") {
        toast.success(action === "credit_note" ? "Avoir cree" : "Statut mis a jour");
        qc.invalidateQueries({ queryKey: queryKeys.invoices.all(tid) });
        qc.invalidateQueries({ queryKey: queryKeys.invoices.detail(tid, id) });
      }
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!invoice) return <p className="text-muted-foreground">Facture introuvable.</p>;

  const isDraft = invoice.status === "draft";
  const isValidated = invoice.status === "validated";
  const isSent = ["sent", "partially_paid", "overdue"].includes(invoice.status);
  const overdue = invoice.status === "overdue";

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={`Facture ${invoice.invoice_number || "Brouillon"}`}>
        <StatusBadge status={invoice.status} />
      </PageHeader>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {isDraft && <>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setActionDialog({ action: "validate", title: "Valider la facture ?", desc: "La facture sera numerotee et verrouille." })}><CheckCircle className="h-4 w-4 mr-1" />Valider</Button>
          <Link href={`/invoices/${id}/edit`}><Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" />Modifier</Button></Link>
        </>}
        {isValidated && <Button size="sm" variant="outline" onClick={() => setActionDialog({ action: "send", title: "Envoyer la facture ?", desc: "La facture sera marquee comme envoyee." })}><Send className="h-4 w-4 mr-1" />Envoyer</Button>}
        {(isValidated || isSent) && <>
          <Button size="sm" variant="outline" onClick={() => doAction.mutate("pdf")}><FileText className="h-4 w-4 mr-1" />PDF</Button>
          <Button size="sm" variant="outline" onClick={() => doAction.mutate("payment_link")}><ExternalLink className="h-4 w-4 mr-1" />Lien paiement</Button>
        </>}
        {isSent && <Link href={`/invoices/${id}/payments`}><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><CreditCard className="h-4 w-4 mr-1" />Paiements</Button></Link>}
        {invoice.status === "paid" && <Button size="sm" variant="outline" className="text-red-400" onClick={() => setActionDialog({ action: "credit_note", title: "Creer un avoir ?", desc: "Un avoir sera cree pour annuler cette facture." })}><Undo2 className="h-4 w-4 mr-1" />Avoir</Button>}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{invoice.client_name}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{formatDate(invoice.issue_date)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Echeance</p><p className={cn("font-medium", overdue && "text-red-400")}>{formatDate(invoice.due_date)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Reste du</p><p className={cn("font-medium", parseFloat(invoice.amount_due) > 0 && "text-amber-400")}>{formatCurrency(invoice.amount_due)}</p></CardContent></Card>
      </div>

      {/* Lines */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Lignes de la facture</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qte</TableHead><TableHead className="text-right">PU HT</TableHead><TableHead className="text-right">TVA</TableHead><TableHead className="text-right">Total TTC</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoice.lines.map((l, i) => (
                <TableRow key={i}><TableCell>{l.description}</TableCell><TableCell className="text-right">{l.quantity} {l.unit}</TableCell><TableCell className="text-right">{formatCurrency(l.unit_price_ht)}</TableCell><TableCell className="text-right">{l.vat_rate}%</TableCell><TableCell className="text-right font-medium">{formatCurrency(l.total_ttc)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-right text-sm">
            <p>Total HT : <span className="font-medium">{formatCurrency(invoice.total_ht)}</span></p>
            <p>TVA : <span className="font-medium">{formatCurrency(invoice.total_vat)}</span></p>
            <p className="text-lg font-bold text-indigo-400">Total TTC : {formatCurrency(invoice.total_ttc)}</p>
            {parseFloat(invoice.amount_paid) > 0 && <p className="text-emerald-400">Paye : {formatCurrency(invoice.amount_paid)}</p>}
          </div>
        </CardContent>
      </Card>

      {actionDialog && <ConfirmDialog open onOpenChange={() => setActionDialog(null)} title={actionDialog.title} description={actionDialog.desc} confirmLabel="Confirmer" onConfirm={() => { doAction.mutate(actionDialog.action); setActionDialog(null); }} isLoading={doAction.isPending} />}
    </div>
  );
}
