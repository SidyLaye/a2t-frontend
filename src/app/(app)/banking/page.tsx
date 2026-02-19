"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { bankingApi } from "@/lib/api/banking";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ArrowRightLeft, Settings2, Loader2 } from "lucide-react";

export default function BankingPage() {
  const qc = useQueryClient();
  const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";

  const { data: accountsData, isLoading } = useQuery({
    queryKey: queryKeys.banking.accounts(tid),
    queryFn: () => bankingApi.listAccounts(),
    enabled: !!tid,
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => bankingApi.syncAccount(id),
    onSuccess: () => { toast.success("Synchronisation lancee"); qc.invalidateQueries({ queryKey: queryKeys.banking.accounts(tid) }); },
    onError: () => toast.error("Erreur de synchronisation"),
  });

  const accounts = accountsData?.results ?? [];

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Banque" description="Comptes bancaires et rapprochement">
        <div className="flex gap-2">
          <Link href="/banking/transactions"><Button size="sm" variant="outline"><ArrowRightLeft className="h-4 w-4 mr-1" />Transactions</Button></Link>
          <Link href="/banking/rules"><Button size="sm" variant="outline"><Settings2 className="h-4 w-4 mr-1" />Regles</Button></Link>
        </div>
      </PageHeader>

      {accounts.length === 0 ? (
        <Card className="bg-card/50 border-border/50"><CardContent className="py-12 text-center"><p className="text-muted-foreground">Aucun compte bancaire connecte.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{acc.bank_name}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => syncMutation.mutate(acc.id)} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{acc.account_name}</p>
                <p className="text-xs text-muted-foreground">{acc.masked_iban}</p>
                <p className="text-2xl font-bold mt-3 tabular-nums">{formatCurrency(acc.balance)}</p>
                {acc.last_synced_at && <p className="text-xs text-muted-foreground mt-1">Synchro : {formatDate(acc.last_synced_at)}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
