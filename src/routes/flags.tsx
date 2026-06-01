import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { FlagsTable } from "@/components/orders/tables/FlagsTable";
import { MOCK_ORDERS, type Order } from "@/lib/orders";
import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  AlertTriangle,
  PackageX,
  Clock,
  ShieldAlert,
  Filter,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/flags")({
  head: () => ({
    meta: [
      { title: "Flags & Exceptions - Halamama LMD" },
      {
        name: "description",
        content: "Monitor and resolve flagged orders and delivery exceptions.",
      },
    ],
  }),
  component: FlagsPage,
});

type FilterCategory = "all" | "delivery_failed" | "flagged" | "tat_exceeded";

const filterCategories: { id: FilterCategory; label: string; icon: typeof AlertTriangle }[] = [
  { id: "all", label: "All Exceptions", icon: Flame },
  { id: "delivery_failed", label: "Delivery Failed", icon: PackageX },
  { id: "flagged", label: "Flagged", icon: ShieldAlert },
  { id: "tat_exceeded", label: "TAT Exceeded", icon: Clock },
];

function FlagsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  const goToOrder = (order: Order) => {
    navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
  };

  // All flagged/exception orders
  const allFlaggedOrders = useMemo(
    () =>
      MOCK_ORDERS.filter(
        (o) =>
          o.status === "Flagged" ||
          o.status === "Delivery Failed" ||
          (() => {
            const m = o.tat.match(/(\d+)h/);
            return m ? parseInt(m[1], 10) > 24 : false;
          })(),
      ),
    [],
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = allFlaggedOrders;

    if (activeFilter === "delivery_failed") {
      result = result.filter((o) => o.status === "Delivery Failed");
    } else if (activeFilter === "flagged") {
      result = result.filter((o) => o.status === "Flagged");
    } else if (activeFilter === "tat_exceeded") {
      result = result.filter((o) => {
        const m = o.tat.match(/(\d+)h/);
        return m ? parseInt(m[1], 10) > 24 : false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.driver?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allFlaggedOrders, activeFilter, searchQuery]);

  // Stat counts
  const deliveryFailedCount = allFlaggedOrders.filter(
    (o) => o.status === "Delivery Failed",
  ).length;
  const flaggedCount = allFlaggedOrders.filter(
    (o) => o.status === "Flagged",
  ).length;
  const tatExceededCount = allFlaggedOrders.filter((o) => {
    const m = o.tat.match(/(\d+)h/);
    return m ? parseInt(m[1], 10) > 24 : false;
  }).length;

  const criticalCount = allFlaggedOrders.filter((o) => {
    if (o.status === "Delivery Failed") return true;
    const m = o.tat.match(/(\d+)h/);
    return m ? parseInt(m[1], 10) > 100 : false;
  }).length;

  const statCards = [
    {
      label: "Total Exceptions",
      value: allFlaggedOrders.length,
      icon: Flame,
      tone: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
    {
      label: "Delivery Failed",
      value: deliveryFailedCount,
      icon: PackageX,
      tone: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      label: "TAT Exceeded",
      value: tatExceededCount,
      icon: Clock,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Critical",
      value: criticalCount,
      icon: AlertTriangle,
      tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-5 p-4 md:p-6">
          {/* Page header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 grid place-items-center">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Flags & Exceptions
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor and resolve flagged orders, delivery failures, and SLA
                  breaches.
                </p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elevated"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl grid place-items-center transition-transform group-hover:scale-110",
                        stat.iconBg,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", stat.iconColor)} />
                    </div>
                  </div>
                  {/* Subtle bottom gradient accent */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />
                </div>
              );
            })}
          </div>

          {/* Filters + search row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Category filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {filterCategories.map((cat) => {
                const Icon = cat.icon;
                const active = activeFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveFilter(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                      active
                        ? "bg-destructive/10 text-destructive ring-1 ring-destructive/20 shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                    <span
                      className={cn(
                        "ml-0.5 min-w-[18px] h-4.5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center",
                        active
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted-foreground/10 text-muted-foreground",
                      )}
                    >
                      {cat.id === "all"
                        ? allFlaggedOrders.length
                        : cat.id === "delivery_failed"
                          ? deliveryFailedCount
                          : cat.id === "flagged"
                            ? flaggedCount
                            : tatExceededCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order, customer, city..."
                className="h-9 w-full rounded-lg border border-border bg-muted/30 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all md:w-[280px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredOrders.length}
            </span>{" "}
            exception{filteredOrders.length !== 1 ? "s" : ""}
            {activeFilter !== "all" && (
              <>
                {" "}
                in{" "}
                <span className="font-semibold text-foreground">
                  {filterCategories.find((c) => c.id === activeFilter)?.label}
                </span>
              </>
            )}
          </div>

          {/* Table */}
          <FlagsTable
            orders={filteredOrders}
            loading={loading}
            onViewOrder={goToOrder}
          />
        </main>
      </div>
    </div>
  );
}
