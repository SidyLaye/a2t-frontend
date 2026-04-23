import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Eye, Download, Check, X, AlertTriangle, Clock, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  received: { label: "Reçu", variant: "secondary" },
  under_review: { label: "En revue", variant: "outline" },
  validated: { label: "Validé", variant: "default" },
  rejected: { label: "Refusé", variant: "destructive" },
  incomplete: { label: "Incomplet", variant: "outline" },
  archived: { label: "Archivé", variant: "secondary" },
};

const categoryLabels: Record<string, string> = {
  bank_statement: "Relevé bancaire",
  purchase_invoice: "Facture achat",
  sales_invoice: "Facture vente",
  contract: "Contrat",
  id_document: "Pièce d'identité",
  rib: "RIB",
  tax_document: "Document fiscal",
  other: "Autre",
};

export default function DocumentsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*, clients(company_name)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = documents.filter((d: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.file_name?.toLowerCase().includes(s) || (d.clients as any)?.company_name?.toLowerCase().includes(s);
  });

  const handleDownload = async (storagePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("client-documents").download(storagePath);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Tous les documents de vos clients</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="received">Reçu</SelectItem>
            <SelectItem value="under_review">En revue</SelectItem>
            <SelectItem value="validated">Validé</SelectItem>
            <SelectItem value="rejected">Refusé</SelectItem>
            <SelectItem value="incomplete">Incomplet</SelectItem>
            <SelectItem value="archived">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucun document trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fichier</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Période</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>{filtered.map((doc: any) => (
              <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                <td className="px-4 py-3 font-medium">{doc.file_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{(doc.clients as any)?.company_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{categoryLabels[doc.category] || doc.category || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                  {doc.period_month && doc.period_year ? `${String(doc.period_month).padStart(2, "0")}/${doc.period_year}` : doc.period_year || "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusConfig[doc.status]?.variant || "secondary"}>
                    {statusConfig[doc.status]?.label || doc.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/documents/${doc.id}`)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc.storage_path, doc.file_name)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
