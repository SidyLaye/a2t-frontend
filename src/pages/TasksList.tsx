import { useState } from "react";
import { Search, Plus, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTasks, getStatusBadge, statusLabels } from "@/lib/mock-data";

export default function TasksList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockTasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold">Tâches</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockTasks.length} tâches au total</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />Nouvelle tâche</Button>
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
            <SelectItem value="a_faire">À faire</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="bloque">Bloqué</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tâche</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Client</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Catégorie</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigné</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priorité</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Échéance</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
          </tr></thead>
          <tbody>{filtered.map(t => (
            <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.clientName}</td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{t.category}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.assignedTo}</td>
              <td className="px-4 py-3"><span className={getStatusBadge(t.priority === 'urgente' ? 'en_retard' : t.priority === 'haute' ? 'pieces_attente' : 'a_faire')}>{t.priority}</span></td>
              <td className="px-4 py-3 text-muted-foreground">{t.dueDate}</td>
              <td className="px-4 py-3"><span className={getStatusBadge(t.status)}>{statusLabels[t.status]}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
