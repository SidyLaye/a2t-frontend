"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "0",
    interval: "mois",
    description: "Pour demarrer votre activite",
    features: ["1 entreprise", "50 factures/mois", "Gestion clients", "Tableau de bord", "Support email"],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "29",
    interval: "mois",
    description: "Pour les entrepreneurs actifs",
    features: ["3 entreprises", "Factures illimitees", "Rapprochement bancaire", "TVA automatique", "OCR justificatifs", "Support prioritaire"],
    cta: "Essai gratuit 14 jours",
    popular: true,
  },
  {
    name: "Cabinet",
    price: "79",
    interval: "mois",
    description: "Pour les cabinets d'expertise",
    features: ["Entreprises illimitees", "Factures illimitees", "Multi-utilisateurs", "Roles et permissions", "API complete", "Support dedie"],
    cta: "Contacter les ventes",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4">Tarifs simples et transparents</h1>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">Choisissez le plan adapte a votre activite. Changez a tout moment.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card/50 border-border/50 relative ${plan.popular ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" : ""}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">Populaire</div>}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-5xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <ul className="space-y-3 text-left">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button className={`w-full ${plan.popular ? "bg-indigo-600 hover:bg-indigo-500" : ""}`} variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
