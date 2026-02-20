"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useUIStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";

import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const pathname = usePathname();
  const isGlobalView = pathname === "/hub" || pathname === "/cabinet" || pathname === "/register-company" || pathname === "/profile";

  if (isGlobalView) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarOpen ? "md:ml-60" : "md:ml-[72px]"
        )}
      >
        <TopBar />
        <main className="p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
