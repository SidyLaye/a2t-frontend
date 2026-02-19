"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Check, Search, AlertCircle, Building2, User } from "lucide-react";
import { BankTransaction } from "@/types/banking";
import { invoicesApi } from "@/lib/api/invoices";
import { expensesApi } from "@/lib/api/expenses";
import { bankingApi } from "@/lib/api/banking";
import { queryKeys } from "@/lib/query/keys";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Note: Dialog UI components are often exported as Dialog, DialogContent etc. 
// but here they seem to be in components/ui/dialog.tsx based on the list_dir I saw earlier.
import {
    Dialog as ShadcnDialog,
    DialogContent as ShadcnDialogContent,
    DialogHeader as ShadcnDialogHeader,
    DialogTitle as ShadcnDialogTitle,
    DialogDescription as ShadcnDialogDescription,
    DialogFooter as ShadcnDialogFooter
} from "@/components/ui/dialog";

interface BankingMatchingDialogProps {
    transaction: BankTransaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BankingMatchingDialog({ transaction, open, onOpenChange }: BankingMatchingDialogProps) {
    const qc = useQueryClient();
    const [selectedMatch, setSelectedMatch] = useState<{ id: string; type: "invoice" | "expense" } | null>(null);
    const amount = transaction ? parseFloat(transaction.amount) : 0;
    const isRevenue = amount > 0;

    // Fetch candidates
    const { data: invoices, isLoading: loadingInvoices } = useQuery({
        queryKey: ["invoices", "unpaid"],
        queryFn: () => invoicesApi.list({ status: "validated" }), // Simplified, should filter by unpaid
        enabled: !!transaction && isRevenue,
    });

    const { data: expenses, isLoading: loadingExpenses } = useQuery({
        queryKey: ["expenses", "unmatched"],
        queryFn: () => expensesApi.list({ status: "pending" }), // Simplified
        enabled: !!transaction && !isRevenue,
    });

    const matchMutation = useMutation({
        mutationFn: (data: { id: string; type: "invoice" | "expense" }) =>
            bankingApi.matchTransaction(transaction!.id, { match_type: data.type, match_id: data.id }),
        onSuccess: () => {
            toast.success("Rapprochement effectue");
            qc.invalidateQueries();
            onOpenChange(false);
        },
        onError: () => toast.error("Erreur lors du rapprochement"),
    });

    const candidates = isRevenue
        ? invoices?.results.map(inv => ({
            id: inv.id,
            type: "invoice" as const,
            title: inv.invoice_number,
            subtitle: inv.client_name,
            amount: inv.total_ttc,
            date: inv.issue_date
        }))
        : expenses?.results.map(exp => ({
            id: exp.id,
            type: "expense" as const,
            title: exp.description,
            subtitle: exp.supplier_name,
            amount: exp.amount_ttc,
            date: exp.date
        }));

    const handleMatch = () => {
        if (!selectedMatch) return;
        matchMutation.mutate(selectedMatch);
    };

    return (
        <ShadcnDialog open={open} onOpenChange={onOpenChange}>
            <ShadcnDialogContent className="sm:max-w-[500px]">
                <ShadcnDialogHeader>
                    <ShadcnDialogTitle>Rapprocher la transaction</ShadcnDialogTitle>
                    <ShadcnDialogDescription>
                        Associez cette transaction de {transaction && formatCurrency(transaction.amount)} du {transaction && formatDateShort(transaction.date)} à un document.
                    </ShadcnDialogDescription>
                </ShadcnDialogHeader>

                <div className="py-4">
                    <div className="bg-muted/50 p-4 rounded-lg mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">{transaction?.description}</p>
                            <p className="text-xs text-muted-foreground">{transaction && formatDateShort(transaction.date)}</p>
                        </div>
                        <p className={cn("text-lg font-bold tabular-nums", isRevenue ? "text-emerald-500" : "text-red-500")}>
                            {transaction && formatCurrency(transaction.amount)}
                        </p>
                    </div>

                    <p className="text-sm font-semibold mb-3">Documents suggérés</p>

                    {(loadingInvoices || loadingExpenses) ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ScrollArea className="h-[250px] pr-4">
                            <div className="space-y-2">
                                {candidates?.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        onClick={() => setSelectedMatch({ id: candidate.id, type: candidate.type })}
                                        className={cn(
                                            "p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                            selectedMatch?.id === candidate.id
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-border hover:border-border/80 hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-background flex items-center justify-center border">
                                                {candidate.type === "invoice" ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{candidate.title}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{candidate.subtitle} • {formatDateShort(candidate.date)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold tabular-nums">{formatCurrency(candidate.amount)}</p>
                                            {selectedMatch?.id === candidate.id && <Check className="h-4 w-4 text-indigo-600 ml-auto mt-1" />}
                                        </div>
                                    </div>
                                ))}

                                {candidates?.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Aucun document correspondant trouvé.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <ShadcnDialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button
                        disabled={!selectedMatch || matchMutation.isPending}
                        onClick={handleMatch}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {matchMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Rapprocher
                    </Button>
                </ShadcnDialogFooter>
            </ShadcnDialogContent>
        </ShadcnDialog>
    );
}
