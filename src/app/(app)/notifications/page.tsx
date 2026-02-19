"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { collaborationApi } from "@/lib/api/collaboration";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(tid),
    queryFn: () => collaborationApi.listNotifications(),
    enabled: !!tid,
  });

  const markAllRead = useMutation({
    mutationFn: () => collaborationApi.markAllRead(),
    onSuccess: () => { toast.success("Tout lu"); qc.invalidateQueries({ queryKey: queryKeys.notifications.all(tid) }); },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => collaborationApi.markRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.notifications.all(tid) }); },
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  const notifications = data?.results ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Notifications">
        {notifications.some((n) => !n.is_read) && (
          <Button size="sm" variant="outline" onClick={() => markAllRead.mutate()}><CheckCheck className="h-4 w-4 mr-1" />Tout marquer comme lu</Button>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <Card className="bg-card/50 border-border/50"><CardContent className="py-12 text-center"><Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="text-muted-foreground">Aucune notification.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={cn("bg-card/50 border-border/50 transition-colors cursor-pointer hover:border-border", !n.is_read && "border-indigo-500/30 bg-indigo-500/5")} onClick={() => !n.is_read && markRead.mutate(n.id)}>
              <CardContent className="p-4 flex items-start gap-3">
                {!n.is_read && <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
