"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { quotesApi } from "@/lib/api/quotes";
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
import { Send, Check, X, ArrowRightLeft, Copy, Pencil, History } from "lucide-react";

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [actionDialog, setActionDialog] = useState<{ action: string; title: string; desc: string } | null>(null);

  const { data: quote, isLoading } = useQuery({ queryKey: queryKeys.quotes.detail(tid, id), queryFn: () => quotesApi.get(id), enabled: !!tid });

  const doAction = useMutation({
    mutationFn: async (action: string) => {
      if (action === "send") return quotesApi.send(id);
      if (action === "accept") return quotesApi.accept(id);
      if (action === "refuse") return quotesApi.refuse(id);
      if (action === "convert") return quotesApi.convertToInvoice(id);
      if (action === "duplicate") return quotesApi.duplicate(id);
    },
    onSuccess: (_, action) => {
      toast.success(action === "convert" ? "Facture creee" : action === "duplicate" ? "Devis duplique" : "Statut mis a jour");
      qc.invalidateQueries({ queryKey: queryKeys.quotes.all(tid) });
      if (action === "duplicate") router.push("/quotes");
      else qc.invalidateQueries({ queryKey: queryKeys.quotes.detail(tid, id) });
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!quote) return <p className="text-muted-foreground">Devis introuvable.</p>;

  const isDraft = quote.status === "draft";
  const isAccepted = quote.status === "accepted";

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={`Devis ${quote.quote_number || "Brouillon"}`}>
        <StatusBadge status={quote.status} />
      </PageHeader>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {isDraft && <><Button size="sm" variant="outline" onClick={() => setActionDialog({ action: "send", title: "Envoyer le devis ?", desc: "Le devis sera marque comme envoye." })}><Send className="h-4 w-4 mr-1" />Envoyer</Button>
        <Link href={`/quotes/${id}/edit`}><Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" />Modifier</Button></Link></>}
        {quote.status === "sent" && <>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setActionDialog({ action: "accept", title: "Accepter le devis ?", desc: "Le devis sera accepte." })}><Check className="h-4 w-4 mr-1" />Accepter</Button>
          <Button size="sm" variant="outline" className="text-red-400" onClick={() => setActionDialog({ action: "refuse", title: "Refuser le devis ?", desc: "Le devis sera refuse." })}><X className="h-4 w-4 mr-1" />Refuser</Button>
        </>}
        {isAccepted && <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setActionDialog({ action: "convert", title: "Convertir en facture ?", desc: "Une facture sera creee a partir de ce devis." })}><ArrowRightLeft className="h-4 w-4 mr-1" />Convertir en facture</Button>}
        <Button size="sm" variant="outline" onClick={() => doAction.mutate("duplicate")}><Copy className="h-4 w-4 mr-1" />Dupliquer</Button>
        <Link href={`/quotes/${id}/history`}><Button size="sm" variant="ghost"><History className="h-4 w-4 mr-1" />Historique</Button></Link>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{quote.client_name}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{formatDate(quote.issue_date)}</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Validite</p><p className="font-medium">{formatDate(quote.validity_date)}</p></CardContent></Card>
      </div>

      {/* Lines */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Lignes du devis</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qte</TableHead><TableHead className="text-right">PU HT</TableHead><TableHead className="text-right">TVA</TableHead><TableHead className="text-right">Total TTC</TableHead></TableRow></TableHeader>
            <TableBody>
              {quote.lines.map((l, i) => (
                <TableRow key={i}><TableCell>{l.description}</TableCell><TableCell className="text-right">{l.quantity} {l.unit}</TableCell><TableCell className="text-right">{formatCurrency(l.unit_price_ht)}</TableCell><TableCell className="text-right">{l.vat_rate}%</TableCell><TableCell className="text-right font-medium">{formatCurrency(l.total_ttc)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-right text-sm">
            <p>Total HT : <span className="font-medium">{formatCurrency(quote.total_ht)}</span></p>
            <p>TVA : <span className="font-medium">{formatCurrency(quote.total_vat)}</span></p>
            <p className="text-lg font-bold text-indigo-400">Total TTC : {formatCurrency(quote.total_ttc)}</p>
          </div>
        </CardContent>
      </Card>

      {actionDialog && <ConfirmDialog open onOpenChange={() => setActionDialog(null)} title={actionDialog.title} description={actionDialog.desc} confirmLabel="Confirmer" onConfirm={() => { doAction.mutate(actionDialog.action); setActionDialog(null); }} isLoading={doAction.isPending} />}
    </div>
  );
}
