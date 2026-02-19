"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  return (
    <Card className={cn("bg-card/50 border-border/50 hover:border-border transition-colors", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-red-400" />}
                <span>{subtitle}</span>
              </div>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
