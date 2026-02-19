"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { entrepreneursApi } from "@/lib/api/entrepreneurs";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, UserCircle } from "lucide-react";

export default function MembersPage() {
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("collaborator");

  const { data: membersData, isLoading } = useQuery({
    queryKey: [...queryKeys.entrepreneurs.detail(tid), "members"],
    queryFn: () => entrepreneursApi.getMembers(tid),
    enabled: !!tid,
  });

  const inviteMutation = useMutation({
    mutationFn: () => entrepreneursApi.inviteMember(tid, { email, role }),
    onSuccess: () => { toast.success("Invitation envoyee"); qc.invalidateQueries({ queryKey: queryKeys.entrepreneurs.detail(tid) }); setOpen(false); setEmail(""); },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  const members = membersData ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Membres" description="Gerez les acces a votre entreprise">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="h-4 w-4 mr-1" />Inviter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Inviter un membre</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50" /></div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="accountant">Comptable</SelectItem>
                    <SelectItem value="collaborator">Collaborateur</SelectItem>
                    <SelectItem value="read_only">Lecture seule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => inviteMutation.mutate()} className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={!email || inviteMutation.isPending}>
                {inviteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Envoyer l&apos;invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="space-y-3">
        {members.map((m) => (
          <Card key={m.id} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{m.user_name || m.user_email}</p>
                <p className="text-xs text-muted-foreground">{m.user_email}</p>
              </div>
              <span className="text-xs bg-muted/50 px-2 py-1 rounded capitalize">{m.role}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
