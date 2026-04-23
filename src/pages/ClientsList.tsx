import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MoreHorizontal, FolderOpen, Send, MessageSquare, FileUp, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockClients, getStatusBadge, statusLabels } from "@/lib/mock-data";

export default function ClientsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockClients.filter((c) => {
    const matchSearch = !search || 
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.siret.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockClients.length} clients au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, email, SIRET..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="en_creation">En création</SelectItem>
            <SelectItem value="suspendu">Suspendu</SelectItem>
            <SelectItem value="ferme">Fermé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entreprise</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Comptable</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Docs manquants</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Prochaine échéance</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr 
                  key={client.id} 
                  className="border-b last:border-0 border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {client.isUrgent && <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />}
                      <span className="font-medium">{client.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {client.contactFirstName} {client.contactLastName}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{client.email}</td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadge(client.status)}>{statusLabels[client.status]}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{client.assignedAccountant}</td>
                  <td className="px-4 py-3 text-center">
                    {client.missingDocs > 0 ? (
                      <span className="text-destructive font-medium">{client.missingDocs}</span>
                    ) : (
                      <span className="text-success">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{client.nextDeadline}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                          <FolderOpen className="h-4 w-4 mr-2" /> Ouvrir le dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Envoyer une demande</DropdownMenuItem>
                        <DropdownMenuItem><MessageSquare className="h-4 w-4 mr-2" /> Envoyer un message</DropdownMenuItem>
                        <DropdownMenuItem><FileUp className="h-4 w-4 mr-2" /> Ajouter un document</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Archive className="h-4 w-4 mr-2" /> Archiver</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
