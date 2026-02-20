"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { entrepreneursApi } from "@/lib/api/entrepreneurs";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import type { EntrepreneurCreate } from "@/types/entrepreneur";
import Link from "next/link";

export default function RegisterCompanyPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<EntrepreneurCreate>();

    const mutation = useMutation({
        mutationFn: (data: EntrepreneurCreate) => entrepreneursApi.create(data),
        onSuccess: () => {
            toast.success("Dossier entreprise créé avec succès !");
            qc.invalidateQueries({ queryKey: queryKeys.entrepreneurs.all() });
            router.push("/hub");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || "Erreur lors de la création du dossier.");
        },
    });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-6">
                <Link href="/hub" className="text-sm text-muted-foreground hover:text-indigo-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Retour au Hub
                </Link>
            </div>

            <PageHeader
                title="Nouveau dossier entreprise"
                description="Remplissez les informations légales pour enregistrer une nouvelle entreprise."
            />

            <Card className="mt-8 bg-card/50 border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Informations Générales</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Raison sociale *</Label>
                                <Input
                                    id="company_name"
                                    {...register("company_name", { required: "Ce champ est obligatoire" })}
                                    placeholder="Ex: Ma Super Entreprise"
                                    className="bg-background/50"
                                />
                                {errors.company_name && <p className="text-xs text-red-500">{errors.company_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="siren">SIREN *</Label>
                                <Input
                                    id="siren"
                                    {...register("siren", { required: "Ce champ est obligatoire", pattern: { value: /^\d{9}$/, message: "Le SIREN doit contenir 9 chiffres" } })}
                                    placeholder="123456789"
                                    className="bg-background/50"
                                />
                                {errors.siren && <p className="text-xs text-red-500">{errors.siren.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vat_number">Numéro de TVA</Label>
                                <Input
                                    id="vat_number"
                                    {...register("vat_number")}
                                    placeholder="FR12345678901"
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email de contact *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email", { required: "Ce champ est obligatoire" })}
                                    placeholder="contact@entreprise.fr"
                                    className="bg-background/50"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input
                                    id="phone"
                                    {...register("phone")}
                                    placeholder="01 02 03 04 05"
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <h3 className="text-sm font-medium">Adresse du siège social</h3>
                            <div className="space-y-2">
                                <Label htmlFor="address_line1">Adresse *</Label>
                                <Input
                                    id="address_line1"
                                    {...register("address_line1", { required: "Ce champ est obligatoire" })}
                                    placeholder="12 rue de la Paix"
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Code Postal *</Label>
                                    <Input
                                        id="postal_code"
                                        {...register("postal_code", { required: "Ce champ est obligatoire" })}
                                        placeholder="75001"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville *</Label>
                                    <Input
                                        id="city"
                                        {...register("city", { required: "Ce champ est obligatoire" })}
                                        placeholder="Paris"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Pays *</Label>
                                    <Input
                                        id="country"
                                        {...register("country", { required: "Ce champ est obligatoire" })}
                                        defaultValue="France"
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Link href="/hub">
                                <Button variant="outline" type="button">Annuler</Button>
                            </Link>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Créer l'entreprise
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
