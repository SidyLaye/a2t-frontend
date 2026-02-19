import { Badge } from "@/components/ui/badge";
import { statusLabel, statusColor } from "@/lib/utils/formatters";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="secondary" className={`${statusColor(status)} border-0 ${className ?? ""}`}>
      {statusLabel(status)}
    </Badge>
  );
}
