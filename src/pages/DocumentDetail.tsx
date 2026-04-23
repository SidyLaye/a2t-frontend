import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, Check, X, AlertTriangle, Clock, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newStatus, setNewStatus] = useState("");
  const [clientComment, setClientComment] = useState("");
  const [internalComment, setInternalComment] = useState("");

  const { data: doc, isLoading } = useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, clients(company_name, contact_first_name, contact_last_name), document_requests(title)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      setNewStatus(data.status);
      setClientComment(data.client_comment || "");
      setInternalComment(data.internal_comment || "");
      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("update-document-status", {
        body: {
          document_id: id,
          status: newStatus,
          client_comment: clientComment,
          internal_comment: internalComment,
        },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Document mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const handleDownload = async () => {
    if (!doc) return;
    const { data } = await supabase.storage.from("client-documents").download(doc.storage_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const quickAction = (status: string) => {
    setNewStatus(status);
    setTimeout(() => updateMutation.mutate(), 0);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;
  if (!doc) return <div className="p-8 text-center text-muted-foreground">Document introuvable</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/documents")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {doc.file_name}
          </h1>
          <p className="text-sm text-muted-foreground">{(doc.clients as any)?.company_name}</p>
        </div>
        <Badge variant={statusConfig[doc.status]?.variant || "secondary"} className="text-sm">
          {statusConfig[doc.status]?.label || doc.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info card */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span>{(doc.clients as any)?.company_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Catégorie</span><span>{categoryLabels[doc.category] || doc.category || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Période</span>
              <span>{doc.period_month && doc.period_year ? `${String(doc.period_month).padStart(2, "0")}/${doc.period_year}` : doc.period_year || "—"}</span>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taille</span><span>{doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(0)} Ko` : "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type MIME</span><span>{doc.mime_type || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date d'upload</span><span>{new Date(doc.created_at).toLocaleDateString("fr-FR")}</span></div>
            {(doc as any).document_requests && (
              <div className="flex justify-between"><span className="text-muted-foreground">Demande liée</span><span>{(doc as any).document_requests.title}</span></div>
            )}
            {doc.reviewed_at && (
              <div className="flex justify-between"><span className="text-muted-foreground">Revu le</span><span>{new Date(doc.reviewed_at).toLocaleDateString("fr-FR")}</span></div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1.5" />Télécharger
            </Button>
          </CardContent>
        </Card>

        {/* Review card */}
        <Card>
          <CardHeader><CardTitle className="text-base">Revue</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => quickAction("under_review")} disabled={updateMutation.isPending}>
                <Clock className="h-3.5 w-3.5 mr-1" />En revue
              </Button>
              <Button size="sm" variant="default" onClick={() => quickAction("validated")} disabled={updateMutation.isPending}>
                <Check className="h-3.5 w-3.5 mr-1" />Valider
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setNewStatus("rejected")} disabled={updateMutation.isPending}>
                <X className="h-3.5 w-3.5 mr-1" />Rejeter
              </Button>
              <Button size="sm" variant="outline" onClick={() => quickAction("incomplete")} disabled={updateMutation.isPending}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />Incomplet
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Reçu</SelectItem>
                  <SelectItem value="under_review">En revue</SelectItem>
                  <SelectItem value="validated">Validé</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                  <SelectItem value="incomplete">Incomplet</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Commentaire client (visible par le client)</Label>
              <Textarea
                value={clientComment}
                onChange={(e) => setClientComment(e.target.value)}
                placeholder="Ce commentaire sera visible par le client..."
                rows={3}
              />
              {newStatus === "rejected" && !clientComment.trim() && (
                <p className="text-xs text-destructive">Un commentaire est obligatoire pour un rejet</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Note interne (admin uniquement)</Label>
              <Textarea
                value={internalComment}
                onChange={(e) => setInternalComment(e.target.value)}
                placeholder="Note interne..."
                rows={3}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || (newStatus === "rejected" && !clientComment.trim())}
            >
              {updateMutation.isPending ? "Mise à jour..." : "Enregistrer la revue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
