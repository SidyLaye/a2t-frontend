import { 
  Users, FileText, Send, MessageSquare, CheckSquare, Calendar, 
  AlertTriangle, Clock, ArrowRight, TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { mockClients, mockTasks, mockDeadlines, mockRequests, mockMessages, getStatusBadge, statusLabels } from "@/lib/mock-data";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const urgentDeadlines = mockDeadlines.filter(d => d.status === 'en_retard' || d.status === 'pieces_attente');
  const pendingTasks = mockTasks.filter(t => t.status === 'a_faire' || t.status === 'en_cours');
  const lateRequests = mockRequests.filter(r => r.status === 'en_retard');
  const unreadMessages = mockMessages.filter(m => !m.readAt && m.senderRole === 'client');
  const totalMissing = mockClients.reduce((sum, c) => sum + c.missingDocs, 0);

  const stats = [
    { label: 'Clients actifs', value: mockClients.filter(c => c.status === 'actif').length, icon: Users, color: 'text-primary' },
    { label: 'Documents manquants', value: totalMissing, icon: FileText, color: 'text-destructive' },
    { label: 'Demandes en retard', value: lateRequests.length, icon: Send, color: 'text-warning' },
    { label: 'Messages non lus', value: unreadMessages.length, icon: MessageSquare, color: 'text-info' },
    { label: 'Tâches en cours', value: pendingTasks.length, icon: CheckSquare, color: 'text-primary' },
    { label: 'Échéances urgentes', value: urgentDeadlines.length, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Échéances urgentes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-destructive" />
                Prochaines échéances
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/echeances')}>
                Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockDeadlines.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.clientName}</p>
                  <p className="text-xs text-muted-foreground">{d.type} · {d.dueDate}</p>
                </div>
                <span className={getStatusBadge(d.status)}>{statusLabels[d.status]}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tâches */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                Tâches prioritaires
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/taches')}>
                Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockTasks.filter(t => t.status !== 'termine').slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.clientName} · {t.assignedTo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(t.priority === 'urgente' ? 'en_retard' : t.priority === 'haute' ? 'pieces_attente' : 'a_faire')}>
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Demandes en retard */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-warning" />
                Demandes de documents
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/demandes')}>
                Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockRequests.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.clientName} · Échéance {r.dueDate}</p>
                </div>
                <span className={getStatusBadge(r.status)}>{statusLabels[r.status]}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Derniers messages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-info" />
                Derniers messages
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockMessages.filter(m => !m.isInternal).slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.senderName}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{m.body}</p>
                </div>
                {!m.readAt && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
