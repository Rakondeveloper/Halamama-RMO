import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  Menu,
  Wrench,
  Warehouse,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  MapPin,
  CalendarDays,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/hooks/useOrders";
import { getSnapshot as getScheduledSnapshot } from "@/lib/scheduled-installations";
import { hasAppointment } from "@/lib/scheduling";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const HALAMAMA_LOGO_URL = "https://halamama.com/cdn/shop/files/halamama_green.svg";

/** Compact Logo Icon Mark for Collapsed Sidebar State */
function HalamamaIconMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-lg shadow-md shadow-emerald-900/10 transition-transform duration-300 group-hover:scale-105",
        className
      )}
    >
      <img
        src="https://halamama.com/cdn/shop/files/ma_gren_background_faviocn.png"
        alt="Halamama"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

interface SidebarContentProps {
  closeOnNavigate?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  closeOnNavigate = false,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarContentProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const search = routerState.location.search as any;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [] } = useOrders();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const isSchedulingPage = ["/customer-care", "/locations", "/calendars"].includes(pathname);
    return {
      "After-Sales Operations": false,
      Scheduling: isSchedulingPage,
    };
  });
  const [activePopover, setActivePopover] = useState<string | null>(null);

  /* ── Dynamic sidebar counts ───────────────────────────── */
  const pickingCount = orders.filter((order) => order.status === "Picking").length;
  const packingCount = orders.filter((order) => order.status === "Packing").length;
  const readyToAssignCount = orders.filter(
    (order) => order.status === "Ready to Assign"
  ).length;
  const deliveredCount = orders.filter((order) => order.status === "Delivered").length;
  const flaggedOrderCount = orders.filter(
    (order) =>
      order.status === "Flagged" ||
      order.status === "Delivery Failed" ||
      (() => {
        const m = order.tat.match(/(\d+)h/);
        return m ? parseInt(m[1], 10) > 24 : false;
      })()
  ).length;
  const returnsCount = orders.filter(
    (o) => Boolean(o.returns) || o.status === "Replacement" || o.status === "Exchange"
  ).length;

  const scheduledCount = getScheduledSnapshot().length;

  const items = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Orders", url: "/orders", icon: Package, badge: orders.length.toString() },
    {
      title: "Picking",
      url: "/orders",
      search: { tab: "Picking" },
      icon: PackageSearch,
      badge: pickingCount.toString(),
    },
    {
      title: "Packing",
      url: "/orders",
      search: { tab: "Packing" },
      icon: Boxes,
      badge: packingCount.toString(),
    },
    {
      title: "Ready to Assign",
      url: "/orders",
      search: { tab: "Ready to Assign" },
      icon: ClipboardCheck,
      badge: readyToAssignCount.toString(),
    },
    {
      title: "Delivered",
      url: "/orders",
      search: { tab: "Delivered" },
      icon: CheckCircle2,
      badge: deliveredCount.toString(),
    },
    {
      title: "Flags & Exceptions",
      url: "/orders",
      search: { tab: "Flags & Exceptions" },
      icon: Flag,
      badge: flaggedOrderCount.toString(),
      danger: true,
    },
    {
      title: "After-Sales Operations",
      icon: RotateCcw,
      subItems: [
        {
          title: "Delivery Failed",
          url: "/orders",
          search: { tab: "Delivery Failed" },
          badge: orders.filter((o) => o.status === "Delivery Failed").length.toString(),
        },
        {
          title: "Returns & Replacements",
          url: "/orders",
          search: { tab: "Returns & Replacements" },
          badge: returnsCount.toString(),
        },
        {
          title: "Replacement",
          url: "/orders",
          search: { tab: "Replacement" },
          badge: orders.filter((o) => o.status === "Replacement").length.toString(),
        },
        {
          title: "Exchange",
          url: "/orders",
          search: { tab: "Exchange" },
          badge: orders.filter((o) => o.status === "Exchange").length.toString(),
        },
      ],
    },
    { title: "Scheduled Inst...", url: "/scheduled", icon: Wrench, badge: scheduledCount.toString() },
    { title: "Warehouses", url: "/warehouses", icon: Warehouse },
    {
      title: "Scheduling",
      icon: CalendarDays,
      subItems: [
        {
          title: "Customer Care Queue",
          url: "/customer-care",
          badge: orders.filter((o) => {
            const isSchedulable =
              o.itemsList?.some?.((i: any) => i.itemType === "MWH" || i.itemType === "VL_SUPPLIER") ??
              false;
            return (
              isSchedulable &&
              !hasAppointment(o.id) &&
              o.status !== "Delivered" &&
              o.status !== "Cancelled"
            );
          }).length.toString(),
        },
        { title: "Locations & Teams", url: "/locations" },
        { title: "Team Calendars", url: "/calendars" },
      ],
    },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "MIS Benchmarks", url: "/mis-benchmarks", icon: TrendingUp },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const renderNavLink = (item: any) => {
    const Icon = item.icon;

    // ── SUBMENU RENDERING ────────────────────────────────────────────────────
    if (item.subItems) {
      const isGroupActive = item.subItems.some((sub: any) => {
        return (
          pathname === sub.url &&
          (!sub.search || sub.search.tab === search?.tab)
        );
      });

      // ── Collapsed Submenu: Floating Popover ─────────────────────────────────
      if (isCollapsed) {
        return (
          <Popover
            key={item.title}
            open={activePopover === item.title}
            onOpenChange={(open) => setActivePopover(open ? item.title : null)}
          >
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "group relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-all duration-200 outline-none",
                        isGroupActive
                          ? "bg-sidebar-accent text-primary shadow-xs font-bold"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      {isGroupActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                      )}
                      <Icon className={cn("h-4.5 w-4.5", isGroupActive && "text-primary")} strokeWidth={isGroupActive ? 2.4 : 2} />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="bg-slate-900 text-slate-50 font-semibold px-3 py-1.5 rounded-lg shadow-xl text-xs">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={14}
              className="w-56 p-2 rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl animate-in fade-in-0 zoom-in-95"
            >
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/60 border-b border-sidebar-border/40 mb-1">
                {item.title}
              </div>
              <div className="space-y-0.5">
                {item.subItems.map((sub: any) => {
                  const isSubActive =
                    pathname === sub.url &&
                    (!sub.search || sub.search.tab === search?.tab);
                  return (
                    <Link
                      key={sub.title}
                      to={sub.url}
                      search={sub.search}
                      onClick={() => setActivePopover(null)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                        isSubActive
                          ? "bg-primary text-primary-foreground font-bold shadow-soft"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <span className="truncate">{sub.title}</span>
                      {sub.badge && sub.badge !== "0" && (
                        <span
                          className={cn(
                            "min-w-[18px] h-4 px-1 rounded-full text-[9px] font-bold grid place-items-center ml-2 shrink-0",
                            isSubActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      }

      // ── Expanded Submenu: Inline Accordion ──────────────────────────────────
      const isOpen = openGroups[item.title];
      return (
        <div key={item.title} className="flex flex-col gap-1 my-1">
          <button
            type="button"
            onClick={() => setOpenGroups((prev) => ({ ...prev, [item.title]: !isOpen }))}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all outline-none",
              isGroupActive
                ? "text-primary font-bold bg-sidebar-accent/30"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className={cn("h-4.5 w-4.5 shrink-0", isGroupActive && "text-primary")} strokeWidth={isGroupActive ? 2.4 : 2} />
            <span className="flex-1 text-left truncate">{item.title}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 shrink-0", isOpen ? "rotate-180" : "rotate-0")} />
          </button>
          {isOpen && (
            <div className="pl-9 space-y-1 mt-1 transition-all">
              {item.subItems.map((sub: any) => {
                const isSubActive =
                  pathname === sub.url &&
                  (!sub.search || sub.search.tab === search?.tab);
                const link = (
                  <Link
                    key={sub.title}
                    to={sub.url}
                    search={sub.search}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                      isSubActive
                        ? "bg-sidebar-accent text-primary font-bold shadow-2xs"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <span className="truncate">{sub.title}</span>
                    {sub.badge && sub.badge !== "0" && (
                      <span className="min-w-[20px] h-4 px-1.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary grid place-items-center ml-2 shrink-0">
                        {sub.badge}
                      </span>
                    )}
                  </Link>
                );
                return closeOnNavigate ? <SheetClose asChild key={sub.title}>{link}</SheetClose> : link;
              })}
            </div>
          )}
        </div>
      );
    }

    // ── REGULAR SINGLE NAV LINK RENDERING ────────────────────────────────────
    const active =
      pathname === item.url &&
      (item.search === undefined
        ? search?.tab === undefined
        : item.search?.tab === search?.tab);

    // Collapsed state: Render centered icon button + Radix Tooltip
    if (isCollapsed) {
      const linkBtn = (
        <Link
          key={item.title}
          to={item.url}
          search={item.search as any}
          className={cn(
            "group relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-all duration-200 outline-none",
            active
              ? "bg-sidebar-accent text-primary shadow-xs font-bold"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          {active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
          )}
          <Icon
            className={cn("h-4.5 w-4.5", active && "text-primary")}
            strokeWidth={active ? 2.4 : 2}
          />
        </Link>
      );

      return (
        <TooltipProvider delayDuration={150} key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              {closeOnNavigate ? <SheetClose asChild>{linkBtn}</SheetClose> : linkBtn}
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={12}
              className="flex items-center gap-2 bg-slate-900 text-slate-50 font-semibold px-3 py-1.5 rounded-lg shadow-xl text-xs"
            >
              <span>{item.title}</span>
              {item.badge && (
                <span
                  className={cn(
                    "min-w-[18px] h-4 px-1.5 rounded-full text-[9px] font-bold grid place-items-center",
                    item.danger
                      ? "bg-red-500 text-white"
                      : "bg-emerald-500 text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Expanded state: Full width layout
    const link = (
      <Link
        key={item.title}
        to={item.url}
        search={item.search as any}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all relative sidebar-premium-item outline-none",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft border-l-2 border-primary font-bold"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-primary" />
        )}
        <Icon
          className={cn("h-4.5 w-4.5 shrink-0", active && "text-primary")}
          strokeWidth={active ? 2.4 : 2}
        />
        <span className="flex-1 truncate">{item.title}</span>
        {item.badge && (
          <span
            className={cn(
              "min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-semibold grid place-items-center shrink-0 ml-1",
              item.danger
                ? "bg-destructive/12 text-destructive"
                : "bg-primary/12 text-primary"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );

    return closeOnNavigate ? (
      <SheetClose asChild key={item.title}>
        {link}
      </SheetClose>
    ) : (
      link
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar/50 select-none">
      {/* ── Sidebar Header ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border/50 transition-all duration-300",
          isCollapsed ? "justify-center px-2 py-5 flex-col gap-3" : "justify-between px-5 py-5"
        )}
      >
        {isCollapsed ? (
          <Link to="/" className="group flex items-center justify-center">
            <HalamamaIconMark />
          </Link>
        ) : (
          <Link to="/" className="group flex items-center">
            <div className="relative transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={HALAMAMA_LOGO_URL}
                alt="Halamama"
                className="h-7 w-auto max-w-[130px] object-contain"
              />
            </div>
          </Link>
        )}

        {/* Toggle Collapse Button */}
        {onToggleCollapse && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isCollapsed && "hover:scale-110"
                  )}
                  aria-label={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4.5 w-4.5 text-primary" />
                  ) : (
                    <PanelLeftClose className="h-4.5 w-4.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "bottom"} sideOffset={8} className="bg-slate-900 text-slate-50 font-medium text-xs px-2.5 py-1">
                {isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* ── Navigation Links ────────────────────────────────────────────────── */}
      <nav className={cn("flex-1 py-4 space-y-1 overflow-y-auto scrollbar-none", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-widest text-sidebar-foreground/50">
            Operations
          </div>
        )}
        {items.map(renderNavLink)}
      </nav>
    </div>
  );
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("halamama_sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("halamama_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside
      className={cn(
        "hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 z-30 transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
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
        <SidebarContent closeOnNavigate isCollapsed={false} />
      </SheetContent>
    </Sheet>
  );
}

