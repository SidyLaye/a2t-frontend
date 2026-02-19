"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, Users, CreditCard } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/entrepreneurs", label: "Entrepreneurs", icon: Building2 },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border/50 bg-card/30 p-6 hidden md:block">
        <h2 className="text-lg font-bold mb-6 gradient-text">Admin A2T</h2>
        <nav className="space-y-1">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors", pathname === item.href ? "bg-indigo-500/10 text-indigo-400" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
