"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CreditCard, Shield, Zap, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { toast } from "sonner";
import axios from "axios";

import { paymentsApi } from "@/lib/api/payments";
import { queryKeys } from "@/lib/query/keys";

export default function BillingPage() {
    const { activeEntrepreneurId } = useTenantStore();
    const tid = activeEntrepreneurId ?? "";

    const { data: sub, isLoading: subLoading } = useQuery({
        queryKey: queryKeys.payments.subscription(tid),
        queryFn: paymentsApi.currentSubscription,
        enabled: !!tid,
        retry: false
    });

    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: queryKeys.payments.plans(),
        queryFn: paymentsApi.listPlans
    });

    const portalMutation = useMutation({
        mutationFn: paymentsApi.createPortal,
        onSuccess: (data) => {
            window.location.href = data.url;
        },
        onError: () => {
            toast.error("Erreur lors de l'accès au portail de paiement.");
        }
    });

    if (!tid) return <div>Sélectionnez une entreprise.</div>;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Abonnement & Facturation"
                description="Gérez votre forfait et vos méthodes de paiement"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-500" />
                            Forfait actuel
                        </CardTitle>
                        <CardDescription>
                            Détails de votre engagement avec A2T
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : sub ? (
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold">{sub.plan.name}</h3>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                            {sub.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Renouvellement le {new Date(sub.current_period_end).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{formatCurrency(sub.plan.price_monthly)}</div>
                                    <p className="text-xs text-muted-foreground">Par mois</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900 flex gap-3">
                                <Zap className="h-5 w-5 text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-800 dark:text-amber-400">Aucun abonnement actif</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-500">
                                        Souscrivez à un forfait pour débloquer toutes les fonctionnalités.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 flex justify-end py-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => portalMutation.mutate()}
                            disabled={!sub || portalMutation.isPending}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Gérer sur Stripe
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Compteur d'usage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <UsageItem label="Factures" used={24} max={sub?.plan.max_invoices_per_month ?? 50} />
                        <UsageItem label="Utilisateurs" used={2} max={sub?.plan.max_users ?? 5} />
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-bold mt-12 mb-6">Nos Forfaits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plansLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[400px]" />)
                ) : (
                    plans?.map((plan: any) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isCurrent={sub?.plan.id === plan.id}
                            tid={tid}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function UsageItem({ label, used, max }: { label: string, used: number, max: number }) {
    const pct = Math.min((used / max) * 100, 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span className="font-medium">{used} / {max}</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all ${pct > 80 ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function PricingCard({ plan, isCurrent, tid }: { plan: any, isCurrent: boolean, tid: string }) {
    const checkoutMutation = useMutation({
        mutationFn: async () => {
            const r = await axios.post(`/api/v1/payments/checkout/`, { plan_id: plan.id }, {
                headers: { "X-Tenant-Id": tid }
            });
            return r.data;
        },
        onSuccess: (data) => {
            window.location.href = data.url;
        },
        onError: () => {
            toast.error("Échec du lancement du paiement.");
        }
    });

    return (
        <Card className={`relative flex flex-col ${isCurrent ? 'border-indigo-600 shadow-indigo-100 dark:shadow-none shadow-lg' : ''}`}>
            {isCurrent && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    Votre forfait
                </div>
            )}
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatCurrency(plan.price_monthly)}</span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <ul className="space-y-3">
                    {plan.max_invoices_per_month && (
                        <FeatureItem text={`${plan.max_invoices_per_month} factures / mois`} />
                    )}
                    <FeatureItem text={`${plan.max_users || 'Illimité'} utilisateurs`} />
                    {Object.entries(plan.features).map(([key, val]: any) => (
                        <FeatureItem key={key} text={val} />
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate()}
                >
                    {isCurrent ? "Gérer l'abonnement" : "Choisir ce forfait"}
                </Button>
            </CardFooter>
        </Card>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{text}</span>
        </li>
    );
}
