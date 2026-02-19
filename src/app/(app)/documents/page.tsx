"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/lib/api/expenses";
import { exportsApi } from "@/lib/api/exports";
import { CommentSheet } from "@/components/collaboration/CommentSheet";
import { queryKeys } from "@/lib/query/keys";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Dropzone } from "@/components/shared/Dropzone";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";
import { FileText, CheckCircle2, AlertCircle, Clock, History, MoreVertical, Download } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { type Expense } from "@/types/expense";
import { toast } from "sonner";

export default function DocumentsPage() {
    const qc = useQueryClient();
    const tid = useTenantStore((s) => s.activeEntrepreneurId) ?? "";
    const { entrepreneurRoles } = useAuthStore();
    const role = tid ? entrepreneurRoles[tid] : null;
    const isAccountant = role === "accountant" || role === "owner";

    const [selectedDoc, setSelectedDoc] = useState<Expense | null>(null);
    const [commentSheetOpen, setCommentSheetOpen] = useState(false);

    // Fetch pending documents (Validation Queue)
    const { data: pendingDocs, isLoading: loadingPending } = useQuery({
        queryKey: queryKeys.expenses.list(tid, { status: "pending" }),
        queryFn: () => expensesApi.list({ status: "pending" }),
        enabled: !!tid,
    });

    const uploadMutation = useMutation({
        mutationFn: async (files: File[]) => {
            for (const file of files) {
                await expensesApi.uploadReceipt(file);
            }
        },
        onSuccess: () => {
            toast.success("Documents envoyés avec succès");
            qc.invalidateQueries({ queryKey: queryKeys.expenses.list(tid, {}) });
        },
        onError: () => toast.error("Erreur lors de l'envoi"),
    });

    const columns: ColumnDef<Expense, unknown>[] = [
        { accessorKey: "date", header: "Date", cell: ({ row }) => <span>{formatDateShort(row.original.date)}</span> },
        { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="font-medium">{row.original.description || "Nouveau justificatif"}</span> },
        { accessorKey: "supplier_name", header: "Fournisseur", cell: ({ row }) => <span>{row.original.supplier_name || "—"}</span> },
        { accessorKey: "amount_ttc", header: "Montant", cell: ({ row }) => <span className="tabular-nums font-medium">{formatCurrency(row.original.amount_ttc)}</span> },
        { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    {isAccountant && row.original.status === "pending" && (
                        <Button size="sm" variant="outline" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                            Valider
                        </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Documents & Justificatifs"
                description="Centralisez vos pièces comptables et suivez leur validation."
            >
                {isAccountant && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                            try {
                                const blob = await exportsApi.exportFEC({
                                    start_date: "2024-01-01",
                                    end_date: "2024-12-31"
                                });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `FEC_${new Date().getFullYear()}.txt`;
                                a.click();
                                toast.success("FEC généré avec succès");
                            } catch (err) {
                                toast.error("Erreur lors de la génération du FEC");
                            }
                        }}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter FEC
                    </Button>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Upload */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-600" />
                                Dépôt rapide
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Dropzone onUpload={(files) => uploadMutation.mutateAsync(files)} />
                            <p className="text-[11px] text-muted-foreground mt-4 text-center">
                                Les documents seront analysés automatiquement par notre moteur OCR.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> En attente
                                </span>
                                <Badge variant="secondary">{pendingDocs?.results.length ?? 0}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Validés (ce mois)
                                </span>
                                <Badge variant="secondary">0</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500" /> Pièces manquantes
                                </span>
                                <Badge variant="destructive">0</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Validation Queue / History */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="queue" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-muted/50 border border-border">
                                <TabsTrigger value="queue" className="gap-2">
                                    <Clock className="h-4 w-4" />
                                    File de validation
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-2">
                                    <History className="h-4 w-4" />
                                    Historique
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="queue" className="mt-0">
                            <Card>
                                <CardContent className="p-0">
                                    <DataTable
                                        columns={columns}
                                        data={pendingDocs?.results ?? []}
                                        isLoading={loadingPending}
                                        emptyTitle="Aucun document en attente"
                                        emptyDescription="Bravo ! Vous êtes à jour dans vos justificatifs."
                                        onRowClick={(doc) => {
                                            setSelectedDoc(doc);
                                            setCommentSheetOpen(true);
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground text-sm italic">
                                    L&apos;historique complet des validations sera bientôt disponible.
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {selectedDoc && (
                <CommentSheet
                    open={commentSheetOpen}
                    onOpenChange={setCommentSheetOpen}
                    modelLabel="expenses.expense"
                    objectId={selectedDoc.id}
                    title={selectedDoc.description || "Justificatif sans nom"}
                    isAccountant={isAccountant}
                />
            )}
        </div>
    );
}
