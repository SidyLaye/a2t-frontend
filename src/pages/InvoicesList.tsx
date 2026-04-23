import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, FileText, Download, Send, MoreHorizontal, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockInvoices, getStatusBadge, statusLabels, type InvoiceType } from "@/lib/mock-data";
import { generateInvoicePdf } from "@/lib/generate-invoice-pdf";

const typeLabels: Record<InvoiceType, string> = { facture: 'Facture', devis: 'Devis', avoir: 'Avoir' };

export default function InvoicesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filtered = mockInvoices.filter((inv) => {
    const matchSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.number.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || inv.type === typeFilter;
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchPayment = paymentFilter === "all" || inv.paymentStatus === paymentFilter;
    return matchSearch && matchType && matchStatus && matchPayment;
  });

  const totalHt = filtered.reduce((s, i) => s + i.subtotalHt, 0);
  const totalTtc = filtered.reduce((s, i) => s + i.totalTtc, 0);
  const totalDue = filtered.reduce((s, i) => s + Math.max(0, i.amountDue), 0);

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Factures & Devis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} document(s)</p>
        </div>
        <Button onClick={() => navigate("/factures/nouveau")}><Plus className="h-4 w-4 mr-1.5" />Nouvelle facture</Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-card"><span className="text-2xl font-bold">{fmt(totalHt)}</span><span className="text-xs text-muted-foreground">Total HT</span></div>
        <div className="stat-card"><span className="text-2xl font-bold">{fmt(totalTtc)}</span><span className="text-xs text-muted-foreground">Total TTC</span></div>
        <div className="stat-card"><span className="text-2xl font-bold text-destructive">{fmt(totalDue)}</span><span className="text-xs text-muted-foreground">Reste à encaisser</span></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par client ou numéro..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="facture">Factures</SelectItem>
            <SelectItem value="devis">Devis</SelectItem>
            <SelectItem value="avoir">Avoirs</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="validee">Validée</SelectItem>
            <SelectItem value="envoyee">Envoyée</SelectItem>
            <SelectItem value="payee">Payée</SelectItem>
            <SelectItem value="en_retard">En retard</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Paiement" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous paiements</SelectItem>
            <SelectItem value="non_paye">Non payé</SelectItem>
            <SelectItem value="partiellement_paye">Part. payé</SelectItem>
            <SelectItem value="paye">Payé</SelectItem>
            <SelectItem value="rembourse">Remboursé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Numéro</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Échéance</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">HT</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">TTC</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paiement</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/factures/${inv.id}`)}>
                <td className="px-4 py-3 font-medium">{inv.number}</td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${inv.type === 'facture' ? 'status-info' : inv.type === 'devis' ? 'status-pending' : 'status-muted'}`}>
                    {typeLabels[inv.type]}
                  </span>
                </td>
                <td className="px-4 py-3">{inv.clientName}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.issueDate}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                <td className="px-4 py-3 text-right font-medium">{fmt(inv.subtotalHt)}</td>
                <td className="px-4 py-3 text-right font-medium">{fmt(inv.totalTtc)}</td>
                <td className="px-4 py-3"><span className={getStatusBadge(inv.status)}>{statusLabels[inv.status]}</span></td>
                <td className="px-4 py-3"><span className={getStatusBadge(inv.paymentStatus)}>{statusLabels[inv.paymentStatus]}</span></td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/factures/${inv.id}`)}><Eye className="h-3.5 w-3.5 mr-2" />Voir</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateInvoicePdf(inv)}><Download className="h-3.5 w-3.5 mr-2" />Télécharger PDF</DropdownMenuItem>
                      <DropdownMenuItem><Send className="h-3.5 w-3.5 mr-2" />Envoyer</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2" />Dupliquer</DropdownMenuItem>
                      {inv.type === 'devis' && <DropdownMenuItem><FileText className="h-3.5 w-3.5 mr-2" />Convertir en facture</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucun document trouvé</p>}
      </div>
    </div>
  );
}
