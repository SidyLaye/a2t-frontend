const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateShortFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0,00 €";
  return currencyFormatter.format(num);
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function formatDateShort(date: string): string {
  return dateShortFormatter.format(new Date(date));
}

export function formatNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    validated: "Validée",
    sent: "Envoyée",
    partially_paid: "Partiellement payée",
    paid: "Payée",
    overdue: "En retard",
    cancelled: "Annulée",
    accepted: "Accepté",
    refused: "Refusé",
    expired: "Expiré",
    invoiced: "Facturé",
    pending: "En attente",
    categorized: "Catégorisé",
    rejected: "Rejeté",
    calculated: "Calculé",
    reviewed: "Révisé",
    submitted: "Soumis",
    active: "Actif",
    past_due: "En retard",
    trialing: "Essai",
    unmatched: "Non rapproché",
    auto_matched: "Auto-rapproché",
    manually_matched: "Rapproché",
    ignored: "Ignoré",
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-zinc-500/20 text-zinc-300",
    validated: "bg-blue-500/20 text-blue-300",
    sent: "bg-indigo-500/20 text-indigo-300",
    partially_paid: "bg-amber-500/20 text-amber-300",
    paid: "bg-emerald-500/20 text-emerald-300",
    overdue: "bg-red-500/20 text-red-300",
    cancelled: "bg-zinc-500/20 text-zinc-400",
    accepted: "bg-emerald-500/20 text-emerald-300",
    refused: "bg-red-500/20 text-red-300",
    expired: "bg-zinc-500/20 text-zinc-400",
    invoiced: "bg-violet-500/20 text-violet-300",
    pending: "bg-amber-500/20 text-amber-300",
    categorized: "bg-blue-500/20 text-blue-300",
    rejected: "bg-red-500/20 text-red-300",
    calculated: "bg-blue-500/20 text-blue-300",
    reviewed: "bg-indigo-500/20 text-indigo-300",
    submitted: "bg-emerald-500/20 text-emerald-300",
    active: "bg-emerald-500/20 text-emerald-300",
    past_due: "bg-red-500/20 text-red-300",
    trialing: "bg-violet-500/20 text-violet-300",
    unmatched: "bg-amber-500/20 text-amber-300",
    auto_matched: "bg-cyan-500/20 text-cyan-300",
    manually_matched: "bg-emerald-500/20 text-emerald-300",
    ignored: "bg-zinc-500/20 text-zinc-400",
  };
  return colors[status] || "bg-zinc-500/20 text-zinc-300";
}
