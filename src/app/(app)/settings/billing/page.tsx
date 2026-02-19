"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { paymentsApi } from "@/lib/api/payments";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, CreditCard } from "lucide-react";

export default function BillingPage() {
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data: subscription, isLoading } = useQuery({
    queryKey: queryKeys.payments.subscription(tid),
    queryFn: () => paymentsApi.currentSubscription(),
    enabled: !!tid,
  });

  const { data: plans } = useQuery({
    queryKey: queryKeys.payments.plans(),
    queryFn: () => paymentsApi.listPlans(),
    enabled: !!tid,
  });

  const portalMutation = useMutation({
    mutationFn: () => paymentsApi.customerPortal(),
    onSuccess: (data) => { window.open(data.portal_url, "_blank"); },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Abonnement" description="Gerez votre plan et votre facturation" />

      {subscription && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm">Plan actuel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{subscription.plan_name || "Plan"}</p>
                <p className="text-sm text-muted-foreground">Statut: <span className="capitalize">{subscription.status}</span></p>
                {subscription.current_period_end && <p className="text-xs text-muted-foreground">Prochain renouvellement: {formatDate(subscription.current_period_end)}</p>}
              </div>
              <CreditCard className="h-8 w-8 text-indigo-400" />
            </div>
            <Button variant="outline" onClick={() => portalMutation.mutate()} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />Gerer sur Stripe
            </Button>
          </CardContent>
        </Card>
      )}

      {(plans ?? []).length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm">Plans disponibles</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {(plans ?? []).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.price_monthly}€/mois</p>
                  </div>
                  <Button size="sm" variant="outline">Choisir</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
