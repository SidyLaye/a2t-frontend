"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Shield, Zap, Globe } from "lucide-react";

const HeroScene = dynamic(() => import("@/components/3d/HeroScene").then((m) => ({ default: m.HeroScene })), { ssr: false });

const features = [
  { icon: FileText, title: "Devis & Factures", description: "Creez, envoyez et suivez vos devis et factures en quelques clics. Conversion automatique devis vers facture." },
  { icon: Users, title: "Gestion clients", description: "Centralisez votre portefeuille clients avec historique complet et fiches detaillees." },
  { icon: TrendingUp, title: "Tableau de bord", description: "Visualisez votre chiffre d'affaires, tresorerie et indicateurs cles en temps reel." },
  { icon: Shield, title: "TVA & Comptabilite", description: "Declarations de TVA automatisees, rapprochement bancaire et export comptable." },
  { icon: Zap, title: "OCR intelligent", description: "Scannez vos justificatifs et laissez l'IA pre-remplir vos depenses automatiquement." },
  { icon: Globe, title: "Multi-entreprise", description: "Gerez plusieurs structures depuis un seul compte avec des roles et permissions granulaires." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="hidden md:block"><HeroScene /></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">A2T Expertise</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plateforme de gestion comptable nouvelle generation pour les entrepreneurs et cabinets d&apos;expertise.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register"><Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8">Commencer gratuitement</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline" className="text-lg px-8">Voir les tarifs</Button></Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Tout ce qu&apos;il vous faut</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">Une solution complete pour gerer votre activite, de la facturation a la declaration de TVA.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="bg-card/50 border-border/50 hover:border-indigo-500/30 transition-colors group">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-indigo-500/10 w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
                    <f.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pret a simplifier votre comptabilite ?</h2>
          <p className="text-muted-foreground mb-8">Rejoignez des centaines d&apos;entrepreneurs qui font confiance a A2T Expertise.</p>
          <Link href="/register"><Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8">Demarrer maintenant</Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 A2T Expertise. Tous droits reserves.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
