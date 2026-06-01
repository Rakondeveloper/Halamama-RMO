import { Bell, Search, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth";
import { MobileSidebar } from "./AppSidebar";

const HALAMAMA_LOGO_URL = "https://halamama.com/cdn/shop/files/halamama_green.svg";

export function TopBar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center gap-4 border-b border-border glass justify-between sm:justify-start">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <div className="flex sm:hidden items-center">
          <img src={HALAMAMA_LOGO_URL} alt="Halamama" className="h-5.5 w-auto object-contain" />
        </div>
      </div>

      <div className="hidden sm:block flex-1 max-w-xl relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search orders, drivers, customers, AWB..."
          className="w-full h-10 pl-10 pr-16 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-card transition-colors"
        />
        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-1.5 items-center rounded-md border border-border bg-card text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl bg-card border border-border">
          <img src={HALAMAMA_LOGO_URL} alt="Halamama" className="h-6 w-6 object-contain" />
        </div>

        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-success/10 border border-success/20">
          <span className="relative flex h-2 w-2 text-success pulse-dot">
            <span className="absolute inset-0 rounded-full bg-success" />
          </span>
          <span className="text-xs font-semibold text-success">All systems live</span>
        </div>

        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border">
          <div className="h-5 w-5 rounded-md bg-[#95BF47] grid place-items-center text-white text-[10px] font-bold">
            S
          </div>
          <span className="text-xs font-medium">Shopify</span>
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
        </div>

        <ThemeToggle />

        <button className="relative h-10 w-10 rounded-xl hover:bg-muted grid place-items-center transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </button>

        <div className="h-8 w-px bg-border mx-1" />

        <button className="flex items-center gap-2.5 h-10 pl-1 pr-3 rounded-xl hover:bg-muted transition-colors">
          <div className="h-8 w-8 rounded-lg bg-white ring-1 ring-border grid place-items-center">
            <img src={HALAMAMA_LOGO_URL} alt="" className="h-5 w-5 object-contain" />
          </div>
          <div className="hidden md:block text-left leading-tight">
            <div className="text-xs font-semibold">{user?.name ?? "Guest"}</div>
            <div className="text-[10px] text-muted-foreground">{user?.role ?? ""}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
