"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { quotesApi } from "@/lib/api/quotes";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export default function QuoteHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data: history, isLoading } = useQuery({
    queryKey: [...queryKeys.quotes.detail(tid, id), "history"],
    queryFn: () => quotesApi.history(id),
    enabled: !!tid,
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Historique du devis" />
      <div className="space-y-3">
        {(history ?? []).length === 0 && <p className="text-muted-foreground text-sm">Aucun historique disponible.</p>}
        {(history ?? []).map((h) => (
          <Card key={h.id} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted/50"><Clock className="h-4 w-4 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">{h.change_type.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">{h.changed_by_email} &middot; {formatDate(h.timestamp)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
