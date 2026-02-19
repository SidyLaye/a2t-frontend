"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui.store";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Wallet,
  Landmark,
  Calculator,
  Settings,
  Files,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TenantSwitcher } from "./TenantSwitcher";

const navGroups = [
  {
    label: "Principal",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { label: "Clients", href: "/clients", icon: Users },
      { label: "Devis", href: "/quotes", icon: FileText },
      { label: "Factures", href: "/invoices", icon: Receipt },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Depenses", href: "/expenses", icon: Wallet },
      { label: "Banque", href: "/banking", icon: Landmark },
      { label: "TVA", href: "/vat", icon: Calculator },
    ],
  },
  {
    label: "Parametres",
    items: [
      { label: "Documents", href: "/documents", icon: Files },
      { label: "Facturation", href: "/billing", icon: CreditCard },
      { label: "Reglages", href: "/settings/company", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-60" : "w-[72px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A2</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
              A2T Expertise
            </span>
          )}
        </Link>
      </div>

      {/* Tenant Switcher */}
      {sidebarOpen && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <TenantSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="px-3 mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
