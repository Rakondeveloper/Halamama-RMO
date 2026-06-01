import { createFileRoute } from "@tanstack/react-router";
import { Package, CheckCircle2, Clock, Loader2, XCircle, Wallet } from "lucide-react";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PipelineTracker } from "@/components/dashboard/PipelineTracker";
import { OperationsTable } from "@/components/dashboard/OperationsTable";
import { FlagsPanel } from "@/components/dashboard/FlagsPanel";
import { DeliveryMap } from "@/components/dashboard/DeliveryMap";
import { StaffMonitoring } from "@/components/dashboard/StaffMonitoring";
import { ACTIVE_STATUSES, MOCK_ORDERS } from "@/lib/orders";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halamama LMD · RouteMyOrder Admin Dashboard" },
      {
        name: "description",
        content:
          "Real-time warehouse and last-mile delivery operations control center for Halamama LMD.",
      },
      { property: "og:title", content: "Halamama LMD · RouteMyOrder" },
      {
        property: "og:description",
        content:
          "Premium logistics dashboard: orders, pipeline, drivers, exceptions and live delivery map.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const deliveredCount = MOCK_ORDERS.filter((order) => order.status === "Delivered").length;
  const pendingAllocationCount = MOCK_ORDERS.filter((order) => order.status === "Ready to Assign").length;
  const inProgressCount = MOCK_ORDERS.filter((order) => ACTIVE_STATUSES.includes(order.status)).length;
  const failedDeliveryCount = MOCK_ORDERS.filter((order) => order.status === "Delivery Failed").length;
  const revenueTotal = MOCK_ORDERS.reduce((sum, order) => sum + order.total, 0);

  const kpis = [
    {
      label: "Total Orders Today",
      value: MOCK_ORDERS.length.toLocaleString(),
      change: 12.4,
      icon: Package,
      tone: "primary" as const,
      spark: [12, 18, 16, 22, 28, 24, 32, 38, 42, 40, 48, 52],
      pulse: true,
    },
    {
      label: "Completed Deliveries",
      value: deliveredCount.toLocaleString(),
      change: 8.2,
      icon: CheckCircle2,
      tone: "success" as const,
      spark: [8, 12, 18, 22, 20, 28, 32, 36, 40, 44, 48, 52],
    },
    {
      label: "Pending Allocation",
      value: pendingAllocationCount.toLocaleString(),
      change: -4.1,
      icon: Clock,
      tone: "warning" as const,
      spark: [40, 38, 42, 36, 34, 30, 28, 32, 30, 28, 26, 32],
    },
    {
      label: "Orders In Progress",
      value: inProgressCount.toLocaleString(),
      change: 6.8,
      icon: Loader2,
      tone: "info" as const,
      spark: [120, 135, 128, 142, 158, 150, 168, 172, 180, 178, 185, 183],
      pulse: true,
    },
    {
      label: "Failed Deliveries",
      value: failedDeliveryCount.toLocaleString(),
      change: -22.5,
      icon: XCircle,
      tone: "danger" as const,
      spark: [22, 24, 20, 18, 16, 18, 15, 14, 12, 14, 13, 14],
    },
    {
      label: "Total Revenue",
      value: `QAR ${revenueTotal.toLocaleString()}`,
      change: 18.3,
      icon: Wallet,
      tone: "purple" as const,
      spark: [120, 140, 160, 180, 170, 200, 220, 210, 240, 250, 260, 248],
    },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Page header */}
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Operations Overview</h1>
                <span className="h-6 px-2 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider grid place-items-center">
                  Live
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Wednesday, May 13 · Real-time view across all warehouses & delivery zones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-soft">
                {["Today", "7D", "30D", "QTD"].map((p, i) => (
                  <button
                    key={p}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>

          {/* Pipeline */}
          <PipelineTracker />

          {/* Map + Flags */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DeliveryMap />
            </div>
            <FlagsPanel />
          </div>

          {/* Staff */}
          <StaffMonitoring />

          {/* Operations table */}
          <OperationsTable />

          <footer className="text-center text-[11px] text-muted-foreground py-4">
            Halamama LMD · RouteMyOrder · Connected to Shopify · v2.4.1
          </footer>
        </main>
      </div>
    </div>
  );
}
