import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BackendNotice } from "@/components/BackendNotice";
import { Button } from "@/components/ui/button";

export default function DocumentDetail() {
  const navigate = useNavigate();
  return (
    <div className="space-y-5 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate("/documents")}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
      </Button>
      <BackendNotice title="Module non disponible">
        Le détail document n'est pas câblé. Voir <code>/documents</code> pour le contexte.
      </BackendNotice>
    </div>
  );
}
