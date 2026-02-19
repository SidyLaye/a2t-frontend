"use client";

import { useQuery } from "@tanstack/react-query";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { dashboardApi } from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrency } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { CashflowChart } from "@/components/charts/CashflowChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
  Landmark,
  FileText,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const { activeEntrepreneurId } = useTenantStore();
  const tid = activeEntrepreneurId ?? "";

  const { data: summary, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(tid),
    queryFn: dashboardApi.summary,
    enabled: !!tid,
  });

  const { data: cashflow } = useQuery({
    queryKey: queryKeys.dashboardCashflow(tid),
    queryFn: dashboardApi.cashflow,
    enabled: !!tid,
  });

  const { data: revenue } = useQuery({
    queryKey: queryKeys.dashboardRevenue(tid),
    queryFn: () => dashboardApi.revenue(12),
    enabled: !!tid,
  });

  const { data: overdue } = useQuery({
    queryKey: queryKeys.dashboardOverdue(tid),
    queryFn: dashboardApi.overdueInvoices,
    enabled: !!tid,
  });

  if (!tid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Selectionnez une entreprise pour continuer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activite">
        <div className="flex gap-2">
          <Link href="/invoices/new">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500">
              <Plus className="h-4 w-4 mr-1" /> Facture
            </Button>
          </Link>
          <Link href="/quotes/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Devis
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Chiffre d'affaires"
            value={formatCurrency(summary?.revenue_mtd ?? "0")}
            subtitle="Ce mois"
            icon={TrendingUp}
            trend="up"
          />
          <KPICard
            title="Depenses"
            value={formatCurrency(summary?.total_expenses_mtd ?? "0")}
            subtitle="Ce mois"
            icon={TrendingDown}
            trend="down"
          />
          <KPICard
            title="En attente"
            value={formatCurrency(summary?.outstanding_amount ?? "0")}
            subtitle={`${summary?.outstanding_invoices ?? 0} factures`}
            icon={Receipt}
          />
          <KPICard
            title="Solde bancaire"
            value={formatCurrency(summary?.bank_balance ?? "0")}
            icon={Landmark}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            {revenue ? (
              <RevenueChart data={revenue} />
            ) : (
              <Skeleton className="h-[300px] rounded-lg" />
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tresorerie</CardTitle>
          </CardHeader>
          <CardContent>
            {cashflow ? (
              <CashflowChart revenue={cashflow.revenue} expenses={cashflow.expenses} />
            ) : (
              <Skeleton className="h-[300px] rounded-lg" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue invoices */}
      {overdue && overdue.length > 0 && (
        <Card className="bg-card/50 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Factures en retard ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdue.slice(0, 5).map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{inv.invoice_number || "Brouillon"}</p>
                        <p className="text-xs text-muted-foreground">{inv.client_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-400">{formatCurrency(inv.amount_due)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
