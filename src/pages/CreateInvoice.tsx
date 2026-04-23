import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Copy, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockClients, type Invoice, type InvoiceItem } from "@/lib/mock-data";
import { generateInvoicePdf } from "@/lib/generate-invoice-pdf";
import { toast } from "sonner";

interface LineItem {
  id: string;
  label: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceHt: number;
  discountPercent: number;
  vatRate: number;
}

const defaultLine = (): LineItem => ({
  id: crypto.randomUUID(),
  label: "",
  description: "",
  quantity: 1,
  unit: "forfait",
  unitPriceHt: 0,
  discountPercent: 0,
  vatRate: 20,
});

/** Round to 2 decimals consistently everywhere */
const r2 = (n: number) => Math.round(n * 100) / 100;

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(r2(n));

const calcLine = (l: LineItem) => {
  const ht = r2(l.quantity * l.unitPriceHt);
  const discount = r2(ht * l.discountPercent / 100);
  const htAfterDiscount = r2(ht - discount);
  const vat = r2(htAfterDiscount * l.vatRate / 100);
  return { ht, discount, htAfterDiscount, vat, ttc: r2(htAfterDiscount + vat) };
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [docType, setDocType] = useState<string>("facture");
  const [clientId, setClientId] = useState<string>("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("FAC-2026-005");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Paiement à 30 jours");
  const [footer, setFooter] = useState("Merci pour votre confiance");
  const [lines, setLines] = useState<LineItem[]>([defaultLine()]);
  const [errors, setErrors] = useState<string[]>([]);

  const totals = lines.reduce(
    (acc, l) => {
      const c = calcLine(l);
      return {
        ht: r2(acc.ht + c.htAfterDiscount),
        discount: r2(acc.discount + c.discount),
        vat: r2(acc.vat + c.vat),
        ttc: r2(acc.ttc + c.ttc),
      };
    },
    { ht: 0, discount: 0, vat: 0, ttc: 0 }
  );

  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addLine = () => setLines([...lines, defaultLine()]);
  const removeLine = (id: string) => lines.length > 1 && setLines(lines.filter((l) => l.id !== id));
  const duplicateLine = (id: string) => {
    const line = lines.find((l) => l.id === id);
    if (line) setLines([...lines, { ...line, id: crypto.randomUUID() }]);
  };

  // ── Validation engine ──
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!clientId) errs.push("Client obligatoire");
    if (!issueDate) errs.push("Date d'émission obligatoire");
    if (!invoiceNumber.trim()) errs.push("Numéro de document obligatoire");
    if (lines.length === 0) errs.push("Au moins une ligne requise");
    if (lines.some((l) => !l.label.trim())) errs.push("Toutes les lignes doivent avoir une désignation");
    if (lines.some((l) => l.quantity <= 0)) errs.push("Les quantités doivent être > 0");
    if (lines.some((l) => l.unitPriceHt < 0)) errs.push("Les prix unitaires ne peuvent pas être négatifs");
    if (lines.some((l) => l.discountPercent < 0 || l.discountPercent > 100)) errs.push("Les remises doivent être entre 0 et 100 %");
    if (dueDate && dueDate < issueDate) errs.push("La date d'échéance doit être ≥ à la date d'émission");
    return errs;
  };

  const handleSave = (asBrouillon: boolean) => {
    if (!asBrouillon) {
      const v = validate();
      if (v.length > 0) {
        setErrors(v);
        toast.error(`${v.length} erreur(s) à corriger`);
        return;
      }
    } else {
      // minimal validation for draft
      if (!clientId) {
        toast.error("Veuillez sélectionner un client");
        return;
      }
    }
    setErrors([]);
    const label = docType === "devis" ? "Devis" : docType === "avoir" ? "Avoir" : "Facture";
    toast.success(asBrouillon ? "Brouillon enregistré" : `${label} créé(e) avec succès`);
    navigate("/factures");
  };

  // ── Build a temporary Invoice object for PDF preview ──
  const buildPreviewInvoice = (): Invoice => {
    const client = mockClients.find((c) => c.id === clientId);
    const items: InvoiceItem[] = lines.map((l, i) => {
      const c = calcLine(l);
      return {
        id: l.id,
        label: l.label || `Ligne ${i + 1}`,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        unitPriceHt: l.unitPriceHt,
        discountPercent: l.discountPercent,
        vatRate: l.vatRate,
        lineTotalHt: c.htAfterDiscount,
        lineTotalTtc: c.ttc,
      };
    });
    return {
      id: "preview",
      clientId,
      clientName: client?.companyName || "—",
      type: docType as Invoice["type"],
      number: invoiceNumber,
      status: "brouillon",
      issueDate,
      dueDate: dueDate || issueDate,
      currency: "EUR",
      subtotalHt: totals.ht,
      totalDiscountHt: totals.discount,
      totalVat: totals.vat,
      totalTtc: totals.ttc,
      amountPaid: 0,
      amountDue: totals.ttc,
      paymentStatus: "non_paye",
      notes,
      terms,
      footer,
      sourceQuoteId: null,
      originalInvoiceId: null,
      items,
      payments: [],
      createdAt: new Date().toISOString().split("T")[0],
      validatedAt: null,
      sentAt: null,
    };
  };

  const handlePreviewPdf = () => {
    const v = validate();
    if (v.length > 0) {
      setErrors(v);
      toast.error("Corrigez les erreurs avant de prévisualiser");
      return;
    }
    setErrors([]);
    generateInvoicePdf(buildPreviewInvoice());
    toast.success("Aperçu PDF téléchargé");
  };

  // ── VAT breakdown for totals display ──
  const vatByRate: Record<number, number> = {};
  lines.forEach((l) => {
    const c = calcLine(l);
    vatByRate[l.vatRate] = r2((vatByRate[l.vatRate] || 0) + c.vat);
  });

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/factures")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            {docType === "devis" ? "Nouveau devis" : docType === "avoir" ? "Nouvel avoir" : "Nouvelle facture"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviewPdf}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Aperçu PDF
          </Button>
          <Button variant="outline" onClick={() => handleSave(true)}>Enregistrer brouillon</Button>
          <Button onClick={() => handleSave(false)}>Valider</Button>
        </div>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-destructive">{errors.length} erreur(s) à corriger</p>
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-destructive/80">• {e}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bloc 1: Informations générales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Type de document</Label>
              <Select value={docType} onValueChange={(v) => { setDocType(v); setInvoiceNumber(`${v === "devis" ? "DEV" : v === "avoir" ? "AV" : "FAC"}-2026-005`); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facture">Facture</SelectItem>
                  <SelectItem value="devis">Devis</SelectItem>
                  <SelectItem value="avoir">Avoir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Client <span className="text-destructive">*</span></Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className={!clientId && errors.length > 0 ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.filter((c) => c.status === "actif").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Numéro <span className="text-destructive">*</span></Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} maxLength={30} />
            </div>
            <div className="space-y-1.5">
              <Label>Date d'émission <span className="text-destructive">*</span></Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date d'échéance</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={issueDate} className={dueDate && dueDate < issueDate ? "border-destructive" : ""} />
              {dueDate && dueDate < issueDate && (
                <p className="text-xs text-destructive">Doit être ≥ à la date d'émission</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Devise</Label>
              <Select defaultValue="EUR">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="EUR">EUR (€)</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bloc 2: Lignes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lignes</CardTitle>
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Ajouter une ligne
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[1fr_80px_80px_100px_80px_80px_100px_70px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>Désignation</span>
            <span>Qté</span>
            <span>Unité</span>
            <span>Prix unit. HT</span>
            <span>Remise %</span>
            <span>TVA %</span>
            <span className="text-right">Total HT</span>
            <span></span>
          </div>
          {lines.map((line) => {
            const c = calcLine(line);
            const hasLabelErr = errors.length > 0 && !line.label.trim();
            const hasQtyErr = errors.length > 0 && line.quantity <= 0;
            return (
              <div key={line.id} className="grid lg:grid-cols-[1fr_80px_80px_100px_80px_80px_100px_70px] gap-2 items-start p-3 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-1.5">
                  <Input
                    placeholder="Désignation *"
                    value={line.label}
                    onChange={(e) => updateLine(line.id, "label", e.target.value)}
                    className={hasLabelErr ? "border-destructive" : ""}
                    maxLength={200}
                  />
                  <Input
                    placeholder="Description (optionnelle)"
                    value={line.description}
                    onChange={(e) => updateLine(line.id, "description", e.target.value)}
                    className="text-xs h-8"
                    maxLength={500}
                  />
                </div>
                <Input
                  type="number"
                  min="0.01"
                  step="0.5"
                  value={line.quantity}
                  onChange={(e) => updateLine(line.id, "quantity", parseFloat(e.target.value) || 0)}
                  className={hasQtyErr ? "border-destructive" : ""}
                />
                <Select value={line.unit} onValueChange={(v) => updateLine(line.id, "unit", v)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forfait">Forfait</SelectItem>
                    <SelectItem value="heures">Heures</SelectItem>
                    <SelectItem value="jours">Jours</SelectItem>
                    <SelectItem value="mois">Mois</SelectItem>
                    <SelectItem value="unite">Unité</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" min="0" step="0.01" value={line.unitPriceHt} onChange={(e) => updateLine(line.id, "unitPriceHt", parseFloat(e.target.value) || 0)} />
                <Input type="number" min="0" max="100" step="1" value={line.discountPercent} onChange={(e) => updateLine(line.id, "discountPercent", parseFloat(e.target.value) || 0)} />
                <Select value={String(line.vatRate)} onValueChange={(v) => updateLine(line.id, "vatRate", parseFloat(v))}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 %</SelectItem>
                    <SelectItem value="5.5">5,5 %</SelectItem>
                    <SelectItem value="10">10 %</SelectItem>
                    <SelectItem value="20">20 %</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-right font-medium text-sm pt-2.5">{fmt(c.htAfterDiscount)}</p>
                <div className="flex gap-1 pt-1.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateLine(line.id)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLine(line.id)} disabled={lines.length === 1}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Bloc 3: Totaux */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Totaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-medium">{fmt(totals.ht + totals.discount)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remises</span>
                  <span className="font-medium text-destructive">– {fmt(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium">{fmt(totals.ht)}</span>
              </div>
              {/* VAT breakdown by rate */}
              {Object.entries(vatByRate).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between">
                  <span className="text-muted-foreground">TVA {rate} %</span>
                  <span className="font-medium">{fmt(amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total TTC</span>
                <span className="font-bold">{fmt(totals.ttc)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bloc 4: Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes et conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Conditions de paiement</Label>
              <Input value={terms} onChange={(e) => setTerms(e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label>Pied de page</Label>
              <Input value={footer} onChange={(e) => setFooter(e.target.value)} maxLength={200} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Notes (visibles sur le document)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => navigate("/factures")}>Annuler</Button>
        <Button variant="outline" onClick={handlePreviewPdf}>
          <Eye className="h-4 w-4 mr-1.5" />
          Aperçu PDF
        </Button>
        <Button variant="outline" onClick={() => handleSave(true)}>Enregistrer brouillon</Button>
        <Button onClick={() => handleSave(false)}>Valider et créer</Button>
      </div>
    </div>
  );
}
