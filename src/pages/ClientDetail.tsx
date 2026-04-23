import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare, FileUp, CheckSquare, Edit, AlertTriangle } from "lucide-react";
import ClientAccessTab from "@/components/client/ClientAccessTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockClients, mockDocuments, mockRequests, mockMessages, mockTasks, mockDeadlines, mockInvoices, getStatusBadge, statusLabels } from "@/lib/mock-data";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = mockClients.find((c) => c.id === id) || mockClients[0];
  const clientDocs = mockDocuments.filter((d) => d.clientId === client.id);
  const clientRequests = mockRequests.filter((r) => r.clientId === client.id);
  const clientMessages = mockMessages.filter((m) => m.clientId === client.id);
  const clientTasks = mockTasks.filter((t) => t.clientId === client.id);
  const clientDeadlines = mockDeadlines.filter((d) => d.clientId === client.id);
  const clientInvoices = mockInvoices.filter((i) => i.clientId === client.id);

  const typeLabels: Record<string, string> = { facture: 'Facture', devis: 'Devis', avoir: 'Avoir' };
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{client.companyName}</h1>
            <span className={getStatusBadge(client.status)}>{statusLabels[client.status]}</span>
            {client.isUrgent && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {client.contactFirstName} {client.contactLastName} · {client.email} · {client.assignedAccountant}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Send className="h-3.5 w-3.5 mr-1.5" />Demander</Button>
          <Button variant="outline" size="sm"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Message</Button>
          <Button variant="outline" size="sm"><FileUp className="h-3.5 w-3.5 mr-1.5" />Document</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="documents">Documents ({clientDocs.length})</TabsTrigger>
          <TabsTrigger value="requests">Demandes ({clientRequests.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages ({clientMessages.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tâches ({clientTasks.length})</TabsTrigger>
          <TabsTrigger value="deadlines">Échéances ({clientDeadlines.length})</TabsTrigger>
          <TabsTrigger value="invoices">Factures ({clientInvoices.length})</TabsTrigger>
          <TabsTrigger value="access">Accès client</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card"><span className="text-2xl font-bold">{clientDocs.filter(d => d.status === 'en_revue' || d.status === 'recu').length}</span><span className="text-xs text-muted-foreground">Documents en attente</span></div>
            <div className="stat-card"><span className="text-2xl font-bold text-destructive">{client.missingDocs}</span><span className="text-xs text-muted-foreground">Pièces manquantes</span></div>
            <div className="stat-card"><span className="text-2xl font-bold">{clientRequests.filter(r => r.status !== 'completee' && r.status !== 'annulee').length}</span><span className="text-xs text-muted-foreground">Demandes en cours</span></div>
            <div className="stat-card"><span className="text-2xl font-bold">{clientMessages.filter(m => !m.readAt).length}</span><span className="text-xs text-muted-foreground">Messages non lus</span></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Prochaines échéances</CardTitle></CardHeader>
              <CardContent>{clientDeadlines.length > 0 ? clientDeadlines.map(d => (
                <div key={d.id} className="flex justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{d.type}</p><p className="text-xs text-muted-foreground">{d.dueDate}</p></div>
                  <span className={getStatusBadge(d.status)}>{statusLabels[d.status]}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">Aucune échéance</p>}</CardContent>
            </Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tâches en cours</CardTitle></CardHeader>
              <CardContent>{clientTasks.length > 0 ? clientTasks.map(t => (
                <div key={t.id} className="flex justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.assignedTo}</p></div>
                  <span className={getStatusBadge(t.status)}>{statusLabels[t.status]}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">Aucune tâche</p>}</CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fichier</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Période</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Envoyé par</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr></thead>
              <tbody>{clientDocs.map(doc => (
                <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{doc.fileName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.period}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.uploadedBy}</td>
                  <td className="px-4 py-3"><span className={getStatusBadge(doc.status)}>{statusLabels[doc.status]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.uploadDate}</td>
                </tr>
              ))}</tbody>
            </table>
            {clientDocs.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucun document</p>}
          </div>
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests" className="mt-4">
          <div className="space-y-3">
            {clientRequests.map(r => (
              <Card key={r.id}><CardContent className="py-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.description}</p><p className="text-xs text-muted-foreground mt-1">Échéance: {r.dueDate} · Relances: {r.reminderCount}</p></div>
                <div className="flex items-center gap-2"><span className={getStatusBadge(r.status)}>{statusLabels[r.status]}</span><Button variant="outline" size="sm">Relancer</Button></div>
              </CardContent></Card>
            ))}
            {clientRequests.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune demande</p>}
          </div>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages" className="mt-4">
          <div className="space-y-3">
            {clientMessages.map(m => (
              <div key={m.id} className={`p-4 rounded-lg border ${m.isInternal ? 'bg-amber-50/50 border-amber-200' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{m.senderName}</span>
                  <span className="text-xs text-muted-foreground">{m.senderRole === 'comptable' ? 'Comptable' : 'Client'}</span>
                  {m.isInternal && <span className="status-badge status-pending">Note interne</span>}
                  {!m.readAt && !m.isInternal && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{m.body}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(m.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            ))}
            {clientMessages.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucun message</p>}
          </div>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks" className="mt-4">
          <div className="space-y-2">
            {clientTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.assignedTo} · {t.dueDate}</p></div>
                <div className="flex gap-2"><span className={getStatusBadge(t.status)}>{statusLabels[t.status]}</span><span className={getStatusBadge(t.priority === 'urgente' ? 'en_retard' : t.priority === 'haute' ? 'pieces_attente' : 'a_faire')}>{t.priority}</span></div>
              </div>
            ))}
            {clientTasks.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune tâche</p>}
          </div>
        </TabsContent>

        {/* Deadlines */}
        <TabsContent value="deadlines" className="mt-4">
          <div className="space-y-2">
            {clientDeadlines.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <div><p className="text-sm font-medium">{d.type}</p><p className="text-xs text-muted-foreground">Échéance: {d.dueDate} · {d.assignedTo}</p>{d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}</div>
                <span className={getStatusBadge(d.status)}>{statusLabels[d.status]}</span>
              </div>
            ))}
            {clientDeadlines.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune échéance</p>}
          </div>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Numéro</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Échéance</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">TTC</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paiement</th>
              </tr></thead>
              <tbody>{clientInvoices.map(inv => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/factures/${inv.id}`)}>
                  <td className="px-4 py-3 font-medium">{inv.number}</td>
                  <td className="px-4 py-3"><span className={`status-badge ${inv.type === 'facture' ? 'status-info' : inv.type === 'devis' ? 'status-pending' : 'status-muted'}`}>{typeLabels[inv.type]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.issueDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(inv.totalTtc)}</td>
                  <td className="px-4 py-3"><span className={getStatusBadge(inv.status)}>{statusLabels[inv.status]}</span></td>
                  <td className="px-4 py-3"><span className={getStatusBadge(inv.paymentStatus)}>{statusLabels[inv.paymentStatus]}</span></td>
                </tr>
              ))}</tbody>
            </table>
            {clientInvoices.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune facture</p>}
          </div>
        </TabsContent>

        {/* Access */}
        <TabsContent value="access" className="mt-4">
          <ClientAccessTab clientId={client.id} clientEmail={client.email} />
        </TabsContent>

        {/* Info */}
        <TabsContent value="info" className="mt-4">
          <Card><CardContent className="py-6">
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div><span className="text-muted-foreground">Entreprise</span><p className="font-medium">{client.companyName}</p></div>
              <div><span className="text-muted-foreground">Contact</span><p className="font-medium">{client.contactFirstName} {client.contactLastName}</p></div>
              <div><span className="text-muted-foreground">Email</span><p className="font-medium">{client.email}</p></div>
              <div><span className="text-muted-foreground">Téléphone</span><p className="font-medium">{client.phone}</p></div>
              <div><span className="text-muted-foreground">SIRET</span><p className="font-medium">{client.siret}</p></div>
              <div><span className="text-muted-foreground">Régime TVA</span><p className="font-medium">{client.vatRegime}</p></div>
              <div><span className="text-muted-foreground">Périodicité TVA</span><p className="font-medium">{client.vatFrequency}</p></div>
              <div><span className="text-muted-foreground">Clôture exercice</span><p className="font-medium">{client.fiscalYearEnd}</p></div>
              <div><span className="text-muted-foreground">Comptable assigné</span><p className="font-medium">{client.assignedAccountant}</p></div>
              <div><span className="text-muted-foreground">Dernière activité</span><p className="font-medium">{client.lastActivity}</p></div>
            </div>
            <Button variant="outline" size="sm" className="mt-6"><Edit className="h-3.5 w-3.5 mr-1.5" />Modifier les informations</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
