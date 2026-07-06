import { useState, useEffect, useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle2, RefreshCw, Play, ArrowRight, Package, Truck, Info, Timer, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/orders";
import { parseTatHours } from "@/lib/orders";

interface ShiftTrackerProps {
  orders: Order[];
}

type SimulationMode = "none" | "on_track" | "high_risk" | "breached";

export function ShiftTracker({ orders }: ShiftTrackerProps) {
  const [simMode, setSimMode] = useState<SimulationMode>("none");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep clock running for live operational telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Workforce Shift Schedule Info (For staff context only; does NOT interrupt order flow)
  const shiftInfo = useMemo(() => {
    const hours = currentTime.getHours();

    let shiftName = "Night Shift";
    let shiftStartHour = 22;
    let shiftEndHour = 6;

    if (hours >= 6 && hours < 14) {
      shiftName = "Morning Shift";
      shiftStartHour = 6;
      shiftEndHour = 14;
    } else if (hours >= 14 && hours < 22) {
      shiftName = "Evening Shift";
      shiftStartHour = 14;
      shiftEndHour = 22;
    }

    return {
      name: shiftName,
      hoursRange: `${shiftStartHour.toString().padStart(2, "0")}:00 – ${shiftEndHour.toString().padStart(2, "0")}:00`,
    };
  }, [currentTime]);

  // 2. Evaluate Continuous 4-Hour SLA for all active orders
  const slaData = useMemo(() => {
    // Process orders and compute SLA details
    const processed = orders.map((o, index) => {
      let tatMins = Math.round(parseTatHours(o.tat || "0h 30m") * 60);

      // Simulation mode overrides for testing SLA thresholds
      if (simMode === "on_track") {
        tatMins = 30 + (index % 4) * 20; // 30m to 90m (all < 180m buffer)
      } else if (simMode === "high_risk") {
        if (index % 2 === 0) tatMins = 195 + (index % 3) * 15; // 195m to 225m (At Risk: remaining <= 60m)
        else tatMins = 45;
      } else if (simMode === "breached") {
        if (index % 3 === 0) tatMins = 255 + (index % 3) * 30; // > 240m (Breached)
        else if (index % 2 === 0) tatMins = 210; // At Risk
        else tatMins = 60;
      }

      const targetMins = 240; // Continuous 4-hour SLA
      const remainingMins = targetMins - tatMins;

      let slaStatus: "on_track" | "at_risk" | "breached" = "on_track";
      if (o.status === "Delivered") {
        slaStatus = "on_track";
      } else if (tatMins > targetMins || o.status === "Delivery Failed") {
        slaStatus = "breached";
      } else if (remainingMins <= 60) {
        slaStatus = "at_risk";
      }

      return {
        ...o,
        tatMins,
        remainingMins,
        slaStatus,
      };
    });

    // Pipeline Stage Categorization
    const activeOrders = processed.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
    const pickingOrders = processed.filter((o) => ["New", "Unfulfilled", "Picking"].includes(o.status));
    const packingOrders = processed.filter((o) => ["Picked", "Packing"].includes(o.status));
    const readyOrders = processed.filter((o) => o.status === "Ready to Assign");
    const inDeliveryOrders = processed.filter((o) => ["Driver Accepted", "Started"].includes(o.status));
    const deliveredOrders = processed.filter((o) => o.status === "Delivered");

    // SLA Risk Summary Counts
    const atRiskCount = activeOrders.filter((o) => o.slaStatus === "at_risk").length;
    const breachedCount = activeOrders.filter((o) => o.slaStatus === "breached").length;
    const onTrackCount = activeOrders.filter((o) => o.slaStatus === "on_track").length;

    // Sorted by SLA Urgency (Lowest remaining time first)
    const sortedByUrgency = [...activeOrders].sort((a, b) => a.remainingMins - b.remainingMins);

    return {
      all: processed,
      activeOrders,
      pickingOrders,
      packingOrders,
      readyOrders,
      inDeliveryOrders,
      deliveredOrders,
      atRiskCount,
      breachedCount,
      onTrackCount,
      sortedByUrgency,
    };
  }, [orders, simMode]);

  const totalActive = slaData.activeOrders.length;
  const totalWarehouse = slaData.pickingOrders.length + slaData.packingOrders.length + slaData.readyOrders.length;

  return (
    <section className="rounded-2xl premium-card overflow-hidden border border-border bg-card">
      {/* Top Banner Header */}
      <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-border bg-muted/20 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Shift Operations Control</h2>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                Continuous 4h SLA Workflow
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live continuous order fulfillment tracking · Maximum 4-hour target delivery window
            </p>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 flex items-center gap-1">
            <RefreshCw className="h-2.5 w-2.5" /> Simulation:
          </span>
          <div className="flex items-center bg-background border border-border rounded-lg p-0.5 shadow-sm">
            {(["none", "on_track", "high_risk", "breached"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSimMode(mode)}
                className={cn(
                  "px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer transition-all uppercase tracking-wider",
                  simMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {mode === "none" ? "Real-Time" : mode === "on_track" ? "All On Track" : mode === "high_risk" ? "High Risk" : "Breached SLA"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Workforce Shift Context & SLA Subhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/10 p-3.5 rounded-xl border border-border/60 gap-2">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-bold text-foreground">
              {shiftInfo.name} ({shiftInfo.hoursRange})
            </div>
            <span className="text-xs text-muted-foreground font-medium hidden md:inline">
              Workforce schedule active · Staff seamless shift handoff enabled
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {slaData.onTrackCount} On Track
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> {slaData.atRiskCount} At Risk
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> {slaData.breachedCount} Breached
            </span>
          </div>
        </div>

        {/* Live Operational Metrics KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Active Orders */}
          <div className="rounded-xl border border-border p-3.5 bg-muted/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
              <span>Total Active Pipeline</span>
              <Package className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-xl font-extrabold text-foreground">{totalActive} Orders</div>
            <div className="text-[10px] text-muted-foreground">
              Processing continuously without shift delays
            </div>
          </div>

          {/* KPI 2: Warehouse Fulfillment Progress */}
          <div className="rounded-xl border border-border p-3.5 bg-muted/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
              <span>Warehouse Operations</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-500" />
            </div>
            <div className="text-xl font-extrabold text-foreground">
              {totalWarehouse} Orders
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-sky-500 h-full" style={{ width: `${totalActive > 0 ? (slaData.pickingOrders.length / totalActive) * 100 : 0}%` }} title="Picking" />
              <div className="bg-fuchsia-500 h-full" style={{ width: `${totalActive > 0 ? (slaData.packingOrders.length / totalActive) * 100 : 0}%` }} title="Packing" />
              <div className="bg-amber-500 h-full" style={{ width: `${totalActive > 0 ? (slaData.readyOrders.length / totalActive) * 100 : 0}%` }} title="Ready" />
            </div>
            <div className="text-[10px] text-muted-foreground flex justify-between">
              <span>{slaData.pickingOrders.length} Pick · {slaData.packingOrders.length} Pack</span>
              <span className="font-semibold text-foreground">{slaData.readyOrders.length} Ready</span>
            </div>
          </div>

          {/* KPI 3: Dispatch & Delivery Progress */}
          <div className="rounded-xl border border-border p-3.5 bg-muted/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
              <span>Out For Delivery</span>
              <Truck className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-foreground">
              {slaData.inDeliveryOrders.length} In Transit
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(slaData.inDeliveryOrders.length + slaData.deliveredOrders.length) > 0 ? (slaData.deliveredOrders.length / (slaData.inDeliveryOrders.length + slaData.deliveredOrders.length)) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">
              {slaData.deliveredOrders.length} orders successfully delivered today
            </div>
          </div>

          {/* KPI 4: Continuous 4h SLA Risk Monitor */}
          <div
            className={cn(
              "rounded-xl border p-3.5 transition-colors space-y-1",
              slaData.breachedCount > 0
                ? "border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-100 animate-pulse"
                : slaData.atRiskCount > 0
                ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                : "border-border bg-muted/10"
            )}
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <span>4h SLA Compliance</span>
              <AlertTriangle className={cn("h-3.5 w-3.5", slaData.breachedCount > 0 ? "text-rose-500" : slaData.atRiskCount > 0 ? "text-amber-500" : "text-emerald-500")} />
            </div>

            {slaData.breachedCount === 0 && slaData.atRiskCount === 0 ? (
              <>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">100% On Track</div>
                <div className="text-[10px] text-muted-foreground">All orders within 4-hour delivery window</div>
              </>
            ) : (
              <>
                <div className={cn("text-xl font-extrabold", slaData.breachedCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>
                  {slaData.breachedCount > 0 ? `${slaData.breachedCount} SLA Breached` : `${slaData.atRiskCount} At Risk`}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {slaData.breachedCount > 0
                    ? `⚠️ Immediate dispatch required for ${slaData.breachedCount} overdue order(s)!`
                    : `⚠️ ${slaData.atRiskCount} order(s) have under 60 minutes remaining`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Continuous Workflow Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Column 1: Live Fulfillment Operations Board */}
          <div className="border border-border rounded-xl p-4 bg-muted/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Play className="h-3 w-3 text-primary fill-primary" /> Live Continuous Pipeline
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {totalActive} Active Orders
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {slaData.activeOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">No active orders in fulfillment pipeline</div>
              ) : (
                slaData.activeOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between bg-card border border-border/60 hover:border-border p-2.5 rounded-lg text-xs transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground">{o.id}</span>
                        <span className="text-[10px] text-muted-foreground">({o.time})</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">{o.customer?.name} · {o.items} items</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                        o.status === "Picking" ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300" :
                        o.status === "Packing" ? "bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300" :
                        o.status === "Ready to Assign" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
                        "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      )}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: SLA Urgency Watchlist */}
          <div className="border border-border rounded-xl p-4 bg-muted/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-amber-500" /> SLA Urgency & Risk Watchlist
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                Sorted by 4h Target
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {slaData.sortedByUrgency.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                  <Info className="h-4 w-4 text-muted-foreground/60" />
                  <span>All operational orders delivered within SLA</span>
                </div>
              ) : (
                slaData.sortedByUrgency.map((o) => {
                  const isBreached = o.slaStatus === "breached";
                  const isAtRisk = o.slaStatus === "at_risk";

                  return (
                    <div
                      key={o.id}
                      className={cn(
                        "flex items-center justify-between bg-card border p-2.5 rounded-lg text-xs transition-colors",
                        isBreached ? "border-rose-500/50 bg-rose-500/5" : isAtRisk ? "border-amber-500/50 bg-amber-500/5" : "border-border/60 hover:border-border"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">{o.id}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1",
                            isBreached ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" :
                            isAtRisk ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
                            "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          )}>
                            {isBreached ? "🔴 SLA Breached" : isAtRisk ? "🟡 At Risk" : "🟢 On Track"}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">
                          {o.customer?.name} · Driver: <span className="font-medium text-foreground">{o.driver || "Unassigned"}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={cn("font-mono font-bold text-xs", isBreached ? "text-rose-600 dark:text-rose-400" : isAtRisk ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                          {isBreached ? "EXPIRED" : `${Math.floor(o.remainingMins / 60)}h ${o.remainingMins % 60}m left`}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Elapsed: {o.tat}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
