import { useState } from "react";
import { Search, Send, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockMessages, mockClients } from "@/lib/mock-data";

export default function MessagesList() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Group messages by client
  const clientIds = [...new Set(mockMessages.map(m => m.clientId))];
  const clientConversations = clientIds.map(cid => {
    const msgs = mockMessages.filter(m => m.clientId === cid);
    const client = mockClients.find(c => c.id === cid);
    const unread = msgs.filter(m => !m.readAt && m.senderRole === 'client').length;
    const lastMsg = msgs[msgs.length - 1];
    return { clientId: cid, clientName: client?.companyName || '', messages: msgs, unread, lastMessage: lastMsg };
  });

  const activeConv = selectedClient ? clientConversations.find(c => c.clientId === selectedClient) : clientConversations[0];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Conversations avec vos clients</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)]">
        {/* Conversations list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-9" />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {clientConversations.map((conv) => (
              <button
                key={conv.clientId}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${(activeConv?.clientId === conv.clientId) ? 'bg-muted/70' : ''}`}
                onClick={() => setSelectedClient(conv.clientId)}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium">{conv.clientName}</span>
                  {conv.unread > 0 && <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5">{conv.unread}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.body}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-card border border-border rounded-lg flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">{activeConv.clientName}</h3>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {activeConv.messages.map((m) => (
                  <div key={m.id} className={`max-w-[75%] ${m.senderRole === 'comptable' ? 'ml-auto' : ''}`}>
                    <div className={`p-3 rounded-lg text-sm ${m.isInternal ? 'bg-amber-50 border border-amber-200' : m.senderRole === 'comptable' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {m.isInternal && <div className="flex items-center gap-1 mb-1 text-xs text-amber-600"><Lock className="h-3 w-3" />Note interne</div>}
                      <p>{m.body}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">{m.senderName} · {new Date(m.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Textarea placeholder="Écrire un message..." className="min-h-[40px] max-h-[100px] resize-none" rows={1} />
                <Button size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Sélectionnez une conversation</div>
          )}
        </div>
      </div>
    </div>
  );
}
