import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, Mail, MapPin, Phone, Receipt } from "lucide-react";

import { BackendNotice } from "@/components/BackendNotice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import type { Invoice, Quote } from "@/lib/api-types";

const fmt = (value: string | number | null | undefined) => {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(n) ? n : 0,
  );
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clientQuery = useQuery({
    queryKey: ["clients", id],
    queryFn: () => api.clients.retrieve(id!),
    enabled: Boolean(id),
    retry: false,
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices", { client: id }],
    queryFn: () => api.invoices.list({ client: id! }),
    enabled: Boolean(id),
    retry: false,
  });

  const quotesQuery = useQuery({
    queryKey: ["quotes", { client: id }],
    queryFn: () => api.quotes.list({ client: id! }),
    enabled: Boolean(id),
    retry: false,
  });

  const invoices: Invoice[] = useMemo(
    () => invoicesQuery.data?.results ?? [],
    [invoicesQuery.data],
  );
  const quotes: Quote[] = useMemo(() => quotesQuery.data?.results ?? [], [quotesQuery.data]);

  if (clientQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (clientQuery.isError || !clientQuery.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
        </Button>
        <BackendNotice title="Client introuvable">
          {(clientQuery.error as ApiError | undefined)?.message ?? "Aucun client correspondant."}
        </BackendNotice>
      </div>
    );
  }

  const c = clientQuery.data;
  const fullName = `${c.first_name} ${c.last_name}`.trim();
  const headline = c.company_name || fullName || c.email;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{headline}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {fullName} · {c.email}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="invoices">Factures ({invoices.length})</TabsTrigger>
          <TabsTrigger value="quotes">Devis ({quotes.length})</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Receipt className="h-4 w-4" /> Factures
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{invoices.length}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" /> Devis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{quotes.length}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  Montant facturé TTC
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {fmt(invoices.reduce((s, i) => s + parseFloat(i.total_ttc || "0"), 0))}
              </CardContent>
            </Card>
          </div>

          <BackendNotice title="Fonctionnalités à venir">
            Les onglets Documents, Demandes, Messages, Tâches et Échéances ne sont pas encore
            câblés au backend. Ils nécessitent l'ajout d'apps Django dédiées.
          </BackendNotice>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {invoicesQuery.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune facture.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Numéro</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                        onClick={() => navigate(`/factures/${inv.id}`)}
                      >
                        <td className="py-2 font-medium">{inv.invoice_number}</td>
                        <td className="py-2 text-muted-foreground">{inv.issue_date}</td>
                        <td className="py-2">{inv.status}</td>
                        <td className="py-2 text-right">{fmt(inv.total_ttc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {quotesQuery.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun devis.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Numéro</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{q.quote_number}</td>
                        <td className="py-2 text-muted-foreground">{q.issue_date}</td>
                        <td className="py-2">{q.status}</td>
                        <td className="py-2 text-right">{fmt(q.total_ttc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {c.email}
              </div>
              {c.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> {c.phone}
                </div>
              )}
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  {c.address_line1}
                  {c.address_line2 && <div>{c.address_line2}</div>}
                  <div>
                    {c.postal_code} {c.city} · {c.country}
                  </div>
                </div>
              </div>
              {c.siren && <div>SIREN : {c.siren}</div>}
              {c.vat_number && <div>TVA : {c.vat_number}</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
