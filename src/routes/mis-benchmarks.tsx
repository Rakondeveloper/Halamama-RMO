import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  TrendingUp, Download, RefreshCw, Search, ChevronLeft, ChevronRight,
  Clock, Target, CheckCircle2, XCircle, ArrowRight, Timer, AlertTriangle,
  ExternalLink, PackageSearch, Boxes, Truck,
} from "lucide-react";
import { misDataProvider } from "@/lib/mis/mis-data-service";
import { formatDuration, formatDurationCompact } from "@/lib/mis/sla-config";
import { formatOvershoot } from "@/lib/mis/sla-evaluator";
import type { MisSummary, SlaSummary, DelayedOrderEntry, MisFilters } from "@/lib/mis/mis-types";
import type { SlaType } from "@/lib/mis/sla-config";
import { toast } from "sonner";

export const Route = createFileRoute("/mis-benchmarks")({
  head: () => ({
    meta: [
      { title: "MIS Benchmarks - Halamama LMD" },
      { name: "description", content: "Track operational SLAs across picking, packing, and delivery." },
    ],
  }),
  component: MisBenchmarksPage,
});

const WAREHOUSES = [
  { value: "all", label: "All Warehouses" },
  { value: "F01", label: "F01 - Fulfillment Center Hilal" },
  { value: "F02", label: "F02 - Main Warehouse - Safety Stock" },
  { value: "MWO", label: "MWO - Main Warehouse Outdoor" },
  { value: "VS", label: "VS - Virtual Stock" },
];

function getDefaultDateRange(): [string, string] {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return [start.toISOString().split("T")[0], end];
}

/* ── KPI Card ──────────────────────────────────────────────────────── */

function SlaCard({
  title, icon: Icon, summary, accentClass, barMetClass, barMissClass,
}: {
  title: string;
  icon: React.ElementType;
  summary: SlaSummary;
  accentClass: string;
  barMetClass: string;
  barMissClass: string;
}) {
  const metPct = summary.totalOrders > 0
    ? (summary.metCount / summary.totalOrders) * 100 : 0;
  const statusColor = summary.metPercent >= 90
    ? "text-emerald-600 dark:text-emerald-400"
    : summary.metPercent >= 70
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className={cn("h-9 w-9 rounded-xl grid place-items-center", accentClass)}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Target: {formatDuration(summary.benchmarkMinutes)}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Headline % */}
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-bold tabular-nums", statusColor)}>
            {summary.metPercent.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">SLA met</span>
          {summary.trendPercent !== null && (
            <span className={cn(
              "text-xs font-semibold ml-auto",
              summary.trendPercent >= 0 ? "text-emerald-600" : "text-red-600",
            )}>
              {summary.trendPercent >= 0 ? "+" : ""}{summary.trendPercent}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex h-3 rounded-full overflow-hidden bg-muted/50">
            <div
              className={cn("rounded-l-full transition-all", barMetClass)}
              style={{ width: `${metPct}%` }}
            />
            <div
              className={cn("transition-all", barMissClass, metPct >= 100 ? "" : "rounded-r-full")}
              style={{ width: `${100 - metPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-medium">
            <span className="text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="inline h-3 w-3 mr-0.5 -mt-0.5" />
              {summary.metCount} met
            </span>
            <span className="text-red-500 dark:text-red-400">
              <XCircle className="inline h-3 w-3 mr-0.5 -mt-0.5" />
              {summary.missedCount} missed
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Avg Time</p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {formatDuration(summary.avgDurationMinutes)}
            </p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Orders</p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {summary.totalOrders.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Delayed Orders Table ──────────────────────────────────────────── */

function DelayedOrdersTable({
  entries, slaType, search, setSearch, page, setPage,
}: {
  entries: DelayedOrderEntry[];
  slaType: SlaType;
  search: string;
  setSearch: (v: string) => void;
  page: number;
  setPage: (v: number) => void;
}) {
  const PAGE_SIZE = 20;
  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) => e.orderId.toLowerCase().includes(q)
        || e.assignedTo.toLowerCase().includes(q)
        || e.warehouse.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showWarehouse = slaType !== "delivery";

  return (
    <div className="space-y-0">
      {/* Search + count */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search orders…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-8 pl-9 pr-3 rounded-lg bg-muted/50 border border-transparent text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          <span className="font-bold text-primary">{filtered.length}</span> delayed orders
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
              {showWarehouse && (
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Outlet / Warehouse</th>
              )}
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Benchmark</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Overshoot</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={showWarehouse ? 8 : 7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  {filtered.length === 0 && entries.length === 0
                    ? "No delayed orders found for this SLA type."
                    : "No results match your search."}
                </td>
              </tr>
            ) : (
              paged.map((entry) => (
                <tr key={entry.orderId} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to="/orders/$orderId"
                      params={{ orderId: entry.orderId }}
                      className="font-mono font-semibold text-primary hover:underline"
                    >
                      {entry.orderId}
                    </Link>
                  </td>
                  {showWarehouse && (
                    <td className="px-4 py-3 text-muted-foreground">{entry.warehouse}</td>
                  )}
                  <td className="px-4 py-3 font-medium text-foreground">{entry.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                      <Clock className="h-3 w-3" />
                      {formatDurationCompact(entry.businessDurationMinutes)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                      <Target className="h-3 w-3" />
                      {formatDurationCompact(entry.benchmarkMinutes)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-red-600 dark:text-red-400 tabular-nums">
                      {formatOvershoot(entry.overshootFactor)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate" title={entry.delayReason}>
                    {entry.delayReason}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/orders/$orderId"
                      params={{ orderId: entry.orderId }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {safePage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              className="h-7 w-7 rounded-lg border border-border grid place-items-center hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              className="h-7 w-7 rounded-lg border border-border grid place-items-center hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Gap Analytics Card ────────────────────────────────────────────── */

function GapCard({
  title, icon: Icon, avg, max, count,
}: {
  title: string;
  icon: React.ElementType;
  avg: number;
  max: number;
  count: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-muted grid place-items-center">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Average</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatDuration(avg)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Longest</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatDuration(max)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Orders</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{count}</p>
        </div>
      </div>
    </div>
  );
}

/* ── CSV Export ─────────────────────────────────────────────────────── */

function exportDelayedCSV(entries: DelayedOrderEntry[], slaType: string) {
  const headers = ["Order ID", "Warehouse", "Assigned To", "Duration (min)", "Benchmark (min)", "Overshoot", "Delay (min)", "Reason"];
  const rows = entries.map((e) => [
    e.orderId, e.warehouse, e.assignedTo,
    e.businessDurationMinutes.toFixed(1), e.benchmarkMinutes.toString(),
    e.overshootFactor.toFixed(1) + "x", e.delayMinutes.toFixed(1), e.delayReason,
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mis_${slaType}_delays.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Main Page ─────────────────────────────────────────────────────── */

function MisBenchmarksPage() {
  const [defaultStart, defaultEnd] = getDefaultDateRange();
  const [dateStart, setDateStart] = useState(defaultStart);
  const [dateEnd, setDateEnd] = useState(defaultEnd);
  const [warehouse, setWarehouse] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [delayTab, setDelayTab] = useState<SlaType>("picking");
  const [delaySearch, setDelaySearch] = useState("");
  const [delayPage, setDelayPage] = useState(1);

  const { data: allOrders = [], refetch, isRefetching } = useOrders();

  const filters: MisFilters = useMemo(() => ({
    dateStart, dateEnd, warehouse,
  }), [dateStart, dateEnd, warehouse]);

  const summary: MisSummary = useMemo(
    () => misDataProvider.getSummary(filters, allOrders),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, allOrders, refreshKey],
  );

  const delayedOrders = useMemo(
    () => misDataProvider.getDelayedOrders(filters, delayTab, allOrders),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, delayTab, allOrders, refreshKey],
  );

  const handleRefresh = async () => {
    const toastId = toast.info("Refreshing benchmarks...");
    try {
      await refetch();
      setRefreshKey((k) => k + 1);
      toast.success("Benchmarks refreshed", { id: toastId });
    } catch (e) {
      toast.error("Failed to refresh benchmarks", { id: toastId });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-6 p-4 md:p-6">

          {/* ── Header ── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center shadow-soft">
                <TrendingUp className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">MIS Benchmarks</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track operational SLAs across picking, packing, and delivery.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isRefetching}
                className="h-9 w-9 rounded-xl border border-border bg-card grid place-items-center hover:bg-muted transition-colors cursor-pointer shadow-soft disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isRefetching && "animate-spin")} />
              </button>
              <button
                onClick={() => exportDelayedCSV(delayedOrders, delayTab)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-soft"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="rounded-2xl border border-border bg-card shadow-soft p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Warehouse</label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger className="h-10 rounded-xl border border-border bg-muted/30 hover:bg-muted/40 transition-all font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border shadow-elevated bg-popover">
                    {WAREHOUSES.map((w) => (
                      <SelectItem key={w.value} value={w.value} className="rounded-lg">{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
                <DatePicker dateString={dateStart} setDateString={setDateStart} placeholder="Start date" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End Date</label>
                <DatePicker dateString={dateEnd} setDateString={setDateEnd} placeholder="End date" />
              </div>
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SlaCard
              title="Picking Performance"
              icon={PackageSearch}
              summary={summary.picking}
              accentClass="bg-gradient-to-br from-violet-500 to-fuchsia-600"
              barMetClass="bg-emerald-500"
              barMissClass="bg-red-400/60"
            />
            <SlaCard
              title="Packing Performance"
              icon={Boxes}
              summary={summary.packing}
              accentClass="bg-gradient-to-br from-indigo-500 to-blue-600"
              barMetClass="bg-emerald-500"
              barMissClass="bg-red-400/60"
            />
            <SlaCard
              title="Delivery Performance"
              icon={Truck}
              summary={summary.delivery}
              accentClass="bg-gradient-to-br from-blue-500 to-cyan-600"
              barMetClass="bg-emerald-500"
              barMissClass="bg-red-400/60"
            />
          </div>

          {/* ── Delayed Orders ── */}
          <section className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <Tabs value={delayTab} onValueChange={(v) => { setDelayTab(v as SlaType); setDelaySearch(""); setDelayPage(1); }}>
              <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Delayed Orders
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Orders that missed their SLA benchmark, sorted by overshoot.
                  </p>
                </div>
                <TabsList className="h-auto gap-0 rounded-xl bg-muted/50 border border-border p-1">
                  <TabsTrigger value="picking" className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all">
                    Picking Delays
                  </TabsTrigger>
                  <TabsTrigger value="packing" className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all">
                    Packing Delays
                  </TabsTrigger>
                  <TabsTrigger value="delivery" className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-soft transition-all">
                    Delivery Delays
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="picking" className="mt-0">
                <DelayedOrdersTable entries={delayedOrders} slaType="picking" search={delaySearch} setSearch={setDelaySearch} page={delayPage} setPage={setDelayPage} />
              </TabsContent>
              <TabsContent value="packing" className="mt-0">
                <DelayedOrdersTable entries={delayedOrders} slaType="packing" search={delaySearch} setSearch={setDelaySearch} page={delayPage} setPage={setDelayPage} />
              </TabsContent>
              <TabsContent value="delivery" className="mt-0">
                <DelayedOrdersTable entries={delayedOrders} slaType="delivery" search={delaySearch} setSearch={setDelaySearch} page={delayPage} setPage={setDelayPage} />
              </TabsContent>
            </Tabs>
          </section>

          {/* ── Operational Gap Analytics ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Operational Gap Analytics</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">Preview</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GapCard
                title="Picking Complete → Packing Start"
                icon={ArrowRight}
                avg={summary.operationalGaps.pickToPack.avgMinutes}
                max={summary.operationalGaps.pickToPack.maxMinutes}
                count={summary.operationalGaps.pickToPack.count}
              />
              <GapCard
                title="Packing Complete → Driver Assignment"
                icon={ArrowRight}
                avg={summary.operationalGaps.packToDriver.avgMinutes}
                max={summary.operationalGaps.packToDriver.maxMinutes}
                count={summary.operationalGaps.packToDriver.count}
              />
            </div>
          </section>

          {/* ── Footer ── */}
          <div className="text-center text-[10px] text-muted-foreground py-4">
            Halamama · MIS Benchmarks Engine · v1.0.0 · Business Time Engine with SLA freeze protection
          </div>

        </main>
      </div>
    </div>
  );
}
