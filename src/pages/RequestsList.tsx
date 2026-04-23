import { useState } from "react";
import { Search, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { mockRequests, getStatusBadge, statusLabels } from "@/lib/mock-data";

export default function RequestsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockRequests.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold">Demandes de documents</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockRequests.length} demandes au total</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />Nouvelle demande</Button>
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
            <SelectItem value="envoyee">Envoyée</SelectItem>
            <SelectItem value="vue">Vue</SelectItem>
            <SelectItem value="partielle">Partielle</SelectItem>
            <SelectItem value="en_retard">En retard</SelectItem>
            <SelectItem value="completee">Complétée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                    <span className={getStatusBadge(r.status)}>{statusLabels[r.status]}</span>
                    <span className={getStatusBadge(r.priority === 'urgente' ? 'en_retard' : r.priority === 'haute' ? 'pieces_attente' : 'a_faire')}>{r.priority}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.clientName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Échéance: {r.dueDate}</span>
                    <span>Créée le: {r.createdAt}</span>
                    {r.reminderCount > 0 && <span>Relances: {r.reminderCount}</span>}
                    {r.lastReminder && <span>Dernière relance: {r.lastReminder}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.status !== 'completee' && r.status !== 'annulee' && (
                    <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Relancer</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
