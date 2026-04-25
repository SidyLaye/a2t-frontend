import { useState } from "react";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDeadlines, getStatusBadge, statusLabels } from "@/lib/mock-data";
import { BackendNotice } from "@/components/BackendNotice";

export default function DeadlinesList() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockDeadlines.filter((d) => statusFilter === "all" || d.status === statusFilter);

  const today = new Date().toISOString().slice(0, 10);
  const thisWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const thisMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const todayDeadlines = filtered.filter(d => d.dueDate <= today);
  const weekDeadlines = filtered.filter(d => d.dueDate > today && d.dueDate <= thisWeek);
  const monthDeadlines = filtered.filter(d => d.dueDate > thisWeek && d.dueDate <= thisMonth);
  const laterDeadlines = filtered.filter(d => d.dueDate > thisMonth);

  const DeadlineRow = ({ d }: { d: typeof mockDeadlines[0] }) => (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{d.type}</p>
          <span className={getStatusBadge(d.status)}>{statusLabels[d.status]}</span>
        </div>
        <p className="text-xs text-muted-foreground">{d.clientName} · {d.assignedTo} · {d.dueDate}</p>
        {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <BackendNotice>Données de démonstration — l'API échéances n'existe pas encore côté Django.</BackendNotice>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold">Échéances</h1>
          <p className="text-sm text-muted-foreground mt-1">Calendrier des échéances comptables</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_retard">En retard</SelectItem>
            <SelectItem value="pieces_attente">Pièces en attente</SelectItem>
            <SelectItem value="a_preparer">À préparer</SelectItem>
            <SelectItem value="pret">Prêt</SelectItem>
            <SelectItem value="envoye">Envoyé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {todayDeadlines.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" /> En retard / Aujourd'hui ({todayDeadlines.length})
            </h3>
            <div className="space-y-2">{todayDeadlines.map(d => <DeadlineRow key={d.id} d={d} />)}</div>
          </div>
        )}
        {weekDeadlines.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-warning mb-2">Cette semaine ({weekDeadlines.length})</h3>
            <div className="space-y-2">{weekDeadlines.map(d => <DeadlineRow key={d.id} d={d} />)}</div>
          </div>
        )}
        {monthDeadlines.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Ce mois ({monthDeadlines.length})</h3>
            <div className="space-y-2">{monthDeadlines.map(d => <DeadlineRow key={d.id} d={d} />)}</div>
          </div>
        )}
        {laterDeadlines.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Plus tard ({laterDeadlines.length})</h3>
            <div className="space-y-2">{laterDeadlines.map(d => <DeadlineRow key={d.id} d={d} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
