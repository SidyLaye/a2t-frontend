"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Wallet, Users, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const tabs = [
  { label: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { label: "Factures", href: "/invoices", icon: Receipt },
  { label: "Depenses", href: "/expenses", icon: Wallet },
  { label: "Clients", href: "/clients", icon: Users },
];

const moreLinks = [
  { label: "Devis", href: "/quotes" },
  { label: "Banque", href: "/banking" },
  { label: "TVA", href: "/vat" },
  { label: "Reglages", href: "/settings/company" },
  { label: "Notifications", href: "/notifications" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive ? "text-indigo-400" : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-muted-foreground">
            <Menu className="h-5 w-5" />
            <span>Plus</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <div className="grid grid-cols-2 gap-3 py-4">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl bg-muted text-sm font-medium hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
