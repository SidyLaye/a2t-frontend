"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield, Smartphone } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div className="max-w-2xl space-y-6">
            <PageHeader title="Mon Profil" description="Gerez vos informations personnelles et de securite" />

            <div className="grid gap-6">
                <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-500" />
                            Informations Personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Prenom</Label>
                                <Input value={user.first_name} readOnly className="bg-background/30 border-dashed" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Nom</Label>
                                <Input value={user.last_name} readOnly className="bg-background/30 border-dashed" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.email} readOnly className="pl-9 bg-background/30 border-dashed" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Telephone</Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={user.phone || "Non renseigne"} readOnly className="pl-9 bg-background/30 border-dashed" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-500" />
                            Securite
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/20 text-sm">
                            <span>Derniere connexion</span>
                            <span className="font-medium text-muted-foreground">Aujourd'hui</span>
                        </div>
                        <Button variant="outline" className="w-full">Modifier le mot de passe</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
