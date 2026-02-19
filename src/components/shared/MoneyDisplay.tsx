import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: string | number;
  className?: string;
  colored?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MoneyDisplay({ amount, className, colored = false, size = "md" }: MoneyDisplayProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = formatCurrency(isNaN(num) ? 0 : num);

  const colorClass = colored
    ? num >= 0
      ? "text-emerald-400"
      : "text-red-400"
    : "";

  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-xl font-semibold" : "text-base";

  return (
    <span className={cn(sizeClass, colorClass, className)}>
      {colored && num > 0 ? "+" : ""}
      {formatted}
    </span>
  );
}
