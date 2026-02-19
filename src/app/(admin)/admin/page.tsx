"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/keys";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: () => adminApi.overview(),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Administration" description="Vue d'ensemble de la plateforme" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Entrepreneurs" value={String(data?.total_entrepreneurs ?? 0)} icon={Building2} />
        <KPICard title="Utilisateurs" value={String(data?.total_users ?? 0)} icon={Users} />
        <KPICard title="Abonnements actifs" value={String(data?.active_subscriptions ?? 0)} icon={CreditCard} />
        <KPICard title="MRR" value={formatCurrency(data?.mrr ?? 0)} icon={TrendingUp} />
      </div>

      {data?.recent_activity && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm">Activite recente</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(data.recent_activity as { id: string; description: string; timestamp: string }[]).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>{a.description}</span>
                  <span className="text-xs text-muted-foreground">{a.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
