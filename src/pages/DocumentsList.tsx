import { BackendNotice } from "@/components/BackendNotice";

export default function DocumentsList() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestion documentaire</p>
      </div>

      <BackendNotice title="Module non disponible">
        Cette page reposait sur Supabase. Le backend Django ne propose pas encore d'API
        Documents. Pour l'activer, il faudra créer une app Django <code>apps.documents</code>
        avec stockage S3/local et endpoints REST, puis recâbler cette page sur
        <code> /api/v1/documents/</code>.
      </BackendNotice>
    </div>
  );
}
