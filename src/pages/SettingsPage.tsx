import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configuration du cabinet</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Informations du cabinet</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div><Label>Nom du cabinet</Label><Input defaultValue="Cabinet Leroy & Associés" /></div>
          <div><Label>Email</Label><Input defaultValue="contact@leroy-compta.fr" /></div>
          <div><Label>Téléphone</Label><Input defaultValue="01 23 45 67 89" /></div>
          <div><Label>Adresse</Label><Input defaultValue="12 rue de la Comptabilité, 75008 Paris" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Notifications email</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Résumé quotidien</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Alertes échéances</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Nouveaux documents</Label><Switch defaultChecked /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Équipe</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Marie Leroy', role: 'Admin cabinet', email: 'marie@leroy-compta.fr' },
              { name: 'Thomas Bernard', role: 'Comptable', email: 'thomas@leroy-compta.fr' },
              { name: 'Julie Martin', role: 'Collaborateur', email: 'julie@leroy-compta.fr' },
            ].map(member => (
              <div key={member.email} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role} · {member.email}</p>
                </div>
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">Ajouter un collaborateur</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  );
}
