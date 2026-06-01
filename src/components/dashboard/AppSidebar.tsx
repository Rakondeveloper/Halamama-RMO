import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  PackageSearch,
  Boxes,
  Flag,
  RotateCcw,
  BarChart3,
  Settings,
  CheckCircle2,
  LogOut,
  Menu,
  Wrench,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { MOCK_ORDERS } from "@/lib/orders";
import { getSnapshot as getScheduledSnapshot } from "@/lib/scheduled-installations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const HALAMAMA_LOGO_URL = "https://halamama.com/cdn/shop/files/halamama_green.svg";

/* ── Dynamic sidebar counts from MOCK_ORDERS ───────────────────────────── */
const pickingCount = MOCK_ORDERS.filter(
  (order) => order.status === "Picking",
).length;
const packingCount = MOCK_ORDERS.filter(
  (order) => order.status === "Packing",
).length;
const readyToAssignCount = MOCK_ORDERS.filter(
  (order) => order.status === "Ready to Assign",
).length;
const deliveredCount = MOCK_ORDERS.filter(
  (order) => order.status === "Delivered",
).length;
const flaggedOrderCount = MOCK_ORDERS.filter(
  (order) =>
    order.status === "Flagged" ||
    order.status === "Delivery Failed" ||
    (() => {
      const m = order.tat.match(/(\d+)h/);
      return m ? parseInt(m[1], 10) > 24 : false;
    })(),
).length;
const returnsCount = MOCK_ORDERS.filter(
  (o) => Boolean(o.returns) || o.status === "Replacement" || o.status === "Exchange",
).length;

const scheduledCount = getScheduledSnapshot().length;

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orders", url: "/orders", icon: Package, badge: MOCK_ORDERS.length.toString() },
  { title: "Picking", url: "/orders", search: { tab: "Picking" }, icon: PackageSearch, badge: pickingCount.toString() },
  { title: "Packing", url: "/orders", search: { tab: "Packing" }, icon: Boxes, badge: packingCount.toString() },
  { title: "Ready to Assign", url: "/orders", search: { tab: "Ready to Assign" }, icon: ClipboardCheck, badge: readyToAssignCount.toString() },
  { title: "Delivered", url: "/orders", search: { tab: "Delivered" }, icon: CheckCircle2, badge: deliveredCount.toString() },
  { title: "Flags & Exceptions", url: "/orders", search: { tab: "Flags & Exceptions" }, icon: Flag, badge: flaggedOrderCount.toString(), danger: true },
  { title: "Returns & Replacements", url: "/orders", search: { tab: "Returns & Replacements" }, icon: RotateCcw, badge: returnsCount.toString() },
  { title: "Scheduled Inst...", url: "/scheduled", icon: Wrench, badge: scheduledCount.toString() },
  { title: "Warehouses", url: "/warehouses", icon: Warehouse },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function SidebarContent({ closeOnNavigate = false }: { closeOnNavigate?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const renderNavLink = (item: (typeof items)[number]) => {
    // If the URL is /orders and we have a search tab, we could consider it active if the current path is /orders and tab matches,
    // but for simplicity, we keep the existing active logic or just let /orders highlight Orders.
    // We will just let active = pathname === item.url.
    const active = pathname === item.url && !item.search;
    const Icon = item.icon;
    const link = (
      <Link
        key={item.title}
        to={item.url}
        search={item.search as any}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-primary" />
        )}
        <Icon
          className={cn("h-4.5 w-4.5", active && "text-primary")}
          strokeWidth={active ? 2.4 : 2}
        />
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <span
            className={cn(
              "min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-semibold grid place-items-center",
              item.danger
                ? "bg-destructive/12 text-destructive"
                : "bg-primary/12 text-primary",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );

    return closeOnNavigate ? (
      <SheetClose asChild key={item.url}>
        {link}
      </SheetClose>
    ) : (
      link
    );
  };

  return (
    <>
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link to="/" className="group flex justify-center">
          <div className="relative w-full transition-transform group-hover:scale-[1.02]">
            <img src={HALAMAMA_LOGO_URL} alt="Halamama" className="h-auto w-full object-contain" />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
          Operations
        </div>
        {items.map(renderNavLink)}
      </nav>

      {/* <div className="m-3 p-4 rounded-2xl bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 animate-shimmer" />
        <div className="relative">
          <div className="text-xs font-semibold opacity-90">Shopify Sync</div>
          <div className="mt-1 text-lg font-bold">Live</div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] opacity-90">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Last sync 12s ago
          </div>
        </div>
      </div> */}

      {/* User / Logout */}
      <div className="border-t border-sidebar-border p-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 hover:bg-destructive/10 hover:text-destructive transition-all">
              <LogOut className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
              <span className="flex-1 text-left">Logout</span>
              {user && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                  {user.name}
                </span>
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1 ring-border">
                <img src={HALAMAMA_LOGO_URL} alt="Halamama" className="h-8 w-8 object-contain" />
              </div>
              <AlertDialogTitle>Logout from Admin Dashboard?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of the Halamama operations dashboard and returned to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-muted lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[min(22rem,86vw)] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard navigation</SheetTitle>
          <SheetDescription>Access dashboard sections and logout controls.</SheetDescription>
        </SheetHeader>
        <SidebarContent closeOnNavigate />
      </SheetContent>
    </Sheet>
  );
}
