import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function CreateClient() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setTimeout(() => {
      toast.success("Client créé avec succès", {
        description: "Dossier initialisé · Invitation envoyée au client",
      });
      setCreating(false);
      navigate("/clients/1");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Nouveau client</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Créer un nouveau dossier client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Type de client</Label>
              <Select defaultValue="societe">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="particulier">Particulier</SelectItem>
                  <SelectItem value="auto-entrepreneur">Auto-entrepreneur</SelectItem>
                  <SelectItem value="societe">Société</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Nom de l'entreprise *</Label><Input placeholder="SARL Exemple" required /></div>
            <div><Label>Prénom du contact *</Label><Input placeholder="Jean" required /></div>
            <div><Label>Nom du contact *</Label><Input placeholder="Dupont" required /></div>
            <div><Label>Email principal *</Label><Input type="email" placeholder="contact@exemple.fr" required /></div>
            <div><Label>Téléphone</Label><Input placeholder="01 23 45 67 89" /></div>
            <div className="sm:col-span-2"><Label>Adresse</Label><Input placeholder="123 rue de la Paix, 75001 Paris" /></div>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informations juridiques</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Forme juridique</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarl">SARL</SelectItem>
                  <SelectItem value="sas">SAS</SelectItem>
                  <SelectItem value="eurl">EURL</SelectItem>
                  <SelectItem value="sasu">SASU</SelectItem>
                  <SelectItem value="sa">SA</SelectItem>
                  <SelectItem value="sci">SCI</SelectItem>
                  <SelectItem value="ei">EI</SelectItem>
                  <SelectItem value="asso">Association</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>SIREN</Label><Input placeholder="123 456 789" /></div>
            <div><Label>SIRET</Label><Input placeholder="123 456 789 00012" /></div>
            <div><Label>N° TVA intracommunautaire</Label><Input placeholder="FR12345678901" /></div>
            <div><Label>Date de création</Label><Input type="date" /></div>
            <div><Label>Activité / Secteur</Label><Input placeholder="Commerce de détail" /></div>
          </CardContent>
        </Card>

        {/* Paramètres comptables */}
        <Card>
          <CardHeader><CardTitle className="text-base">Paramètres comptables</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Régime fiscal</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reel_normal">Réel normal</SelectItem>
                  <SelectItem value="reel_simplifie">Réel simplifié</SelectItem>
                  <SelectItem value="micro">Micro-entreprise</SelectItem>
                  <SelectItem value="franchise">Franchise en base</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Régime TVA</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reel_normal">Réel normal</SelectItem>
                  <SelectItem value="reel_simplifie">Réel simplifié</SelectItem>
                  <SelectItem value="franchise">Franchise en base</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Périodicité TVA</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensuelle">Mensuelle</SelectItem>
                  <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                  <SelectItem value="annuelle">Annuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Date de clôture</Label><Input placeholder="31/12" /></div>
            <div>
              <Label>Comptable assigné</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marie">Marie Leroy</SelectItem>
                  <SelectItem value="thomas">Thomas Bernard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Collaborateur</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="julie">Julie Martin</SelectItem>
                  <SelectItem value="lucas">Lucas Petit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mode de transmission des pièces</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manuel">Manuel</SelectItem>
                  <SelectItem value="mensuel">Mensuel</SelectItem>
                  <SelectItem value="temps_reel">Temps réel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut du dossier</Label>
              <Select defaultValue="en_creation">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_creation">En création</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accès client */}
        <Card>
          <CardHeader><CardTitle className="text-base">Accès client</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>Créer un compte client automatiquement</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Envoyer l'invitation par email</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Activer l'espace client mobile</Label><Switch /></div>
          </CardContent>
        </Card>

        {/* Options automatiques */}
        <Card>
          <CardHeader><CardTitle className="text-base">Options automatiques</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>Créer checklist de démarrage</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Créer espace documents</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Programmer première demande documents</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Créer échéances automatiques</Label><Switch defaultChecked /></div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle className="text-base">Notes & tags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['TVA', 'Paie', 'Juridique', 'Client premium', 'Retard fréquent'].map(tag => (
                  <label key={tag} className="flex items-center gap-1.5 text-sm bg-muted px-2.5 py-1 rounded-md cursor-pointer hover:bg-accent">
                    <input type="checkbox" className="rounded" />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Niveau de priorité</Label>
              <Select><SelectTrigger><SelectValue placeholder="Normal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basse">Basse</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes internes</Label><Textarea placeholder="Notes visibles uniquement par le cabinet..." rows={3} /></div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button>
          <Button type="button" variant="secondary">Enregistrer brouillon</Button>
          <Button type="submit" disabled={creating}>
            <Save className="h-4 w-4 mr-1.5" />
            {creating ? "Création..." : "Créer le client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
