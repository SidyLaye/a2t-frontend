import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Send, Copy, FileText, CreditCard, RotateCcw, Ban, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { mockInvoices, mockClients, getStatusBadge, statusLabels } from "@/lib/mock-data";
import { generateInvoicePdf } from "@/lib/generate-invoice-pdf";
import { toast } from "sonner";

const typeLabels: Record<string, string> = { facture: 'Facture', devis: 'Devis', avoir: 'Avoir' };
const paymentMethodLabels: Record<string, string> = { virement: 'Virement', carte: 'Carte', especes: 'Espèces', cheque: 'Chèque', prelevement: 'Prélèvement' };
const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = mockInvoices.find(i => i.id === id) || mockInvoices[0];
  const client = mockClients.find(c => c.id === invoice.clientId);
  const linkedInvoice = invoice.originalInvoiceId ? mockInvoices.find(i => i.id === invoice.originalInvoiceId) : null;

  const isBrouillon = invoice.status === 'brouillon';

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/factures")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <span className={`status-badge ${invoice.type === 'facture' ? 'status-info' : invoice.type === 'devis' ? 'status-pending' : 'status-muted'}`}>
              {typeLabels[invoice.type]}
            </span>
            <span className={getStatusBadge(invoice.status)}>{statusLabels[invoice.status]}</span>
            <span className={getStatusBadge(invoice.paymentStatus)}>{statusLabels[invoice.paymentStatus]}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{invoice.clientName} · Émise le {invoice.issueDate} · Échéance {invoice.dueDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {isBrouillon && <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5 mr-1.5" />Modifier</Button>}
        <Button variant="outline" size="sm" onClick={() => { generateInvoicePdf(invoice); toast.success("PDF téléchargé"); }}><Download className="h-3.5 w-3.5 mr-1.5" />Télécharger PDF</Button>
        <Button variant="outline" size="sm" onClick={() => toast.success("Facture envoyée")}><Send className="h-3.5 w-3.5 mr-1.5" />Envoyer</Button>
        <Button variant="outline" size="sm" onClick={() => toast.success("Facture dupliquée")}><Copy className="h-3.5 w-3.5 mr-1.5" />Dupliquer</Button>
        {invoice.type === 'devis' && <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1.5" />Convertir en facture</Button>}
        {invoice.type === 'facture' && invoice.status !== 'annulee' && (
          <>
            <Button variant="outline" size="sm"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Enregistrer paiement</Button>
            <Button variant="outline" size="sm"><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Relancer</Button>
            <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1.5" />Créer un avoir</Button>
            <Button variant="outline" size="sm" className="text-destructive"><Ban className="h-3.5 w-3.5 mr-1.5" />Annuler</Button>
          </>
        )}
      </div>

      <Tabs defaultValue="apercu">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="paiements">Paiements ({invoice.payments.length})</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        {/* Preview */}
        <TabsContent value="apercu" className="mt-4">
          <Card>
            <CardContent className="py-6">
              {/* Invoice header */}
              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold">ComptaFlow</h2>
                  <p className="text-xs text-muted-foreground">123 Rue de la Comptabilité<br />75001 Paris<br />SIRET: 999 888 777 00011<br />TVA: FR12999888777</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold">{typeLabels[invoice.type]} {invoice.number}</h2>
                  <p className="text-sm text-muted-foreground">Date: {invoice.issueDate}</p>
                  <p className="text-sm text-muted-foreground">Échéance: {invoice.dueDate}</p>
                </div>
              </div>

              {/* Client */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Facturer à</p>
                <p className="font-medium">{invoice.clientName}</p>
                {client && (
                  <p className="text-sm text-muted-foreground">{client.contactFirstName} {client.contactLastName}<br />{client.email}<br />SIRET: {client.siret}</p>
                )}
              </div>

              {linkedInvoice && (
                <div className="mb-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                  <p className="text-sm">Avoir lié à la facture <button className="text-primary font-medium underline" onClick={() => navigate(`/factures/${linkedInvoice.id}`)}>{linkedInvoice.number}</button></p>
                </div>
              )}

              {/* Lines */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Désignation</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Qté</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">P.U. HT</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Remise</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">TVA</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2.5">
                        <p className="font-medium">{item.label}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </td>
                      <td className="text-right py-2.5">{item.quantity} {item.unit}</td>
                      <td className="text-right py-2.5">{fmt(Math.abs(item.unitPriceHt))}</td>
                      <td className="text-right py-2.5">{item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}</td>
                      <td className="text-right py-2.5">{item.vatRate}%</td>
                      <td className="text-right py-2.5 font-medium">{fmt(item.lineTotalHt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  {invoice.totalDiscountHt !== 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Remises</span><span>-{fmt(Math.abs(invoice.totalDiscountHt))}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="font-medium">{fmt(invoice.subtotalHt)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total TVA</span><span>{fmt(invoice.totalVat)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-base"><span className="font-semibold">Total TTC</span><span className="font-bold">{fmt(invoice.totalTtc)}</span></div>
                  {invoice.amountPaid !== 0 && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Payé</span><span className="text-green-600">{fmt(invoice.amountPaid)}</span></div>
                      <div className="flex justify-between font-semibold"><span>Reste à payer</span><span className={invoice.amountDue > 0 ? 'text-destructive' : ''}>{fmt(invoice.amountDue)}</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {(invoice.notes || invoice.terms) && (
                <div className="mt-8 pt-4 border-t space-y-2">
                  {invoice.terms && <p className="text-sm"><span className="font-medium">Conditions :</span> {invoice.terms}</p>}
                  {invoice.notes && <p className="text-sm"><span className="font-medium">Notes :</span> {invoice.notes}</p>}
                </div>
              )}

              {/* Legal */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée. Une indemnité forfaitaire de 40 € pour frais de recouvrement sera également due.
                  {invoice.footer && <><br />{invoice.footer}</>}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="paiements" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="stat-card"><span className="text-2xl font-bold">{fmt(invoice.totalTtc)}</span><span className="text-xs text-muted-foreground">Total TTC</span></div>
            <div className="stat-card"><span className="text-2xl font-bold text-green-600">{fmt(invoice.amountPaid)}</span><span className="text-xs text-muted-foreground">Payé</span></div>
            <div className="stat-card"><span className="text-2xl font-bold text-destructive">{fmt(Math.max(0, invoice.amountDue))}</span><span className="text-xs text-muted-foreground">Reste à payer</span></div>
          </div>
          {invoice.payments.length > 0 ? (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                </tr></thead>
                <tbody>{invoice.payments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{p.paymentDate}</td>
                    <td className="px-4 py-3">{paymentMethodLabels[p.paymentMethod] || p.paymentMethod}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.reference}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.notes || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucun paiement enregistré</p>
          )}
          {invoice.amountDue > 0 && <Button><CreditCard className="h-4 w-4 mr-1.5" />Enregistrer un paiement</Button>}
        </TabsContent>

        {/* History */}
        <TabsContent value="historique" className="mt-4">
          <div className="space-y-3">
            {invoice.sentAt && (
              <div className="flex gap-3 p-3 bg-card border border-border rounded-lg">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div><p className="text-sm font-medium">Facture envoyée</p><p className="text-xs text-muted-foreground">{invoice.sentAt}</p></div>
              </div>
            )}
            {invoice.validatedAt && (
              <div className="flex gap-3 p-3 bg-card border border-border rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                <div><p className="text-sm font-medium">Facture validée</p><p className="text-xs text-muted-foreground">{invoice.validatedAt}</p></div>
              </div>
            )}
            <div className="flex gap-3 p-3 bg-card border border-border rounded-lg">
              <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1.5" />
              <div><p className="text-sm font-medium">Facture créée</p><p className="text-xs text-muted-foreground">{invoice.createdAt}</p></div>
            </div>
            {invoice.payments.map(p => (
              <div key={p.id} className="flex gap-3 p-3 bg-card border border-border rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                <div><p className="text-sm font-medium">Paiement de {fmt(p.amount)} ({paymentMethodLabels[p.paymentMethod]})</p><p className="text-xs text-muted-foreground">{p.paymentDate} · Réf: {p.reference}</p></div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
