import { Home, ClipboardList, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriverTab } from "@/routes/driver";

interface DriverLayoutProps {
  children: React.ReactNode;
  activeTab: DriverTab;
  onTabChange: (tab: DriverTab) => void;
}

export function DriverLayout({ children, activeTab, onTabChange }: DriverLayoutProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-muted/20 text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="font-bold text-sm">HM</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Halamama Driver</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background pb-safe shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => onTabChange("dashboard")}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-foreground transition-colors",
            activeTab === "dashboard" && "text-foreground font-medium"
          )}
        >
          <Home className={cn("h-5 w-5", activeTab === "dashboard" && "fill-foreground/10")} />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange("history")}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-foreground transition-colors",
            activeTab === "history" && "text-foreground font-medium"
          )}
        >
          <ClipboardList className={cn("h-5 w-5", activeTab === "history" && "fill-foreground/10")} />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-foreground transition-colors",
            activeTab === "profile" && "text-foreground font-medium"
          )}
        >
          <UserCircle className={cn("h-5 w-5", activeTab === "profile" && "fill-foreground/10")} />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
}
