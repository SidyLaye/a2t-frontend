"use client";

import { useQuery } from "@tanstack/react-query";
import { monitoringApi, PortfolioEntreprise } from "@/lib/api/monitoring";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, AlertCircle, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useTenantStore } from "@/lib/stores/tenant.store";

export default function AdminDashboardPage() {
    const { setActiveTenant } = useTenantStore();
    const { data: portfolio, isLoading } = useQuery({
        queryKey: ["admin", "portfolio"],
        queryFn: monitoringApi.portfolio,
    });

    const getHealthBadge = (score: PortfolioEntreprise["health_score"]) => {
        switch (score) {
            case "good":
                return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Sain</Badge>;
            case "warning":
                return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"><Clock className="h-3 w-3 mr-1" /> À surveiller</Badge>;
            case "critical":
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"><AlertCircle className="h-3 w-3 mr-1" /> Critique</Badge>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Management Cabinet"
                    description="Vue d'ensemble de tous les dossiers clients"
                />
                <Link href="/hub">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour au Hub
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total dossiers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{portfolio?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pièces en attente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">
                            {portfolio?.reduce((acc, curr) => acc + curr.pending_docs, 0) || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Non rapproché</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {portfolio?.reduce((acc, curr) => acc + curr.unmatched_transactions, 0) || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Portefeuille Dossiers</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entreprise</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-center">Documents</TableHead>
                                    <TableHead className="text-center">Transactions</TableHead>
                                    <TableHead>Dernière Sync</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {portfolio?.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-semibold">{item.name}</TableCell>
                                        <TableCell>{getHealthBadge(item.health_score)}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={item.pending_docs > 10 ? "text-red-500 font-bold" : ""}>
                                                {item.pending_docs}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={item.unmatched_transactions > 20 ? "text-red-500 font-bold" : ""}>
                                                {item.unmatched_transactions}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {item.last_sync
                                                ? formatDistanceToNow(new Date(item.last_sync), { addSuffix: true, locale: fr })
                                                : "Jamais"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setActiveTenant(item.id);
                                                    window.location.href = "/dashboard";
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Ouvrir
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
