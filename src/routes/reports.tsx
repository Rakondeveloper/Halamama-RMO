import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MOCK_ORDERS } from "@/lib/orders";
import { useState } from "react";
import {
  BarChart3,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingBag,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics - Halamama LMD" },
      {
        name: "description",
        content:
          "Business intelligence reports — order trends, revenue analytics, delivery performance and channel insights.",
      },
    ],
  }),
  component: ReportsPage,
});

/* ------------------------------------------------------------------ */
/*  Mock analytics data derived from MOCK_ORDERS                      */
/* ------------------------------------------------------------------ */

const DAILY_ORDERS_DATA = [
  { day: "May 7", orders: 38, revenue: 6200, delivered: 30, failed: 2 },
  { day: "May 8", orders: 45, revenue: 7800, delivered: 38, failed: 3 },
  { day: "May 9", orders: 52, revenue: 9100, delivered: 44, failed: 1 },
  { day: "May 10", orders: 41, revenue: 7200, delivered: 35, failed: 4 },
  { day: "May 11", orders: 60, revenue: 10500, delivered: 52, failed: 2 },
  { day: "May 12", orders: 55, revenue: 9800, delivered: 48, failed: 3 },
  { day: "May 13", orders: MOCK_ORDERS.length, revenue: MOCK_ORDERS.reduce((s, o) => s + o.total, 0), delivered: MOCK_ORDERS.filter(o => o.status === "Delivered").length, failed: MOCK_ORDERS.filter(o => o.status === "Delivery Failed").length },
];

const STATUS_BREAKDOWN = (() => {
  const map: Record<string, number> = {};
  MOCK_ORDERS.forEach((o) => {
    map[o.status] = (map[o.status] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
})();

const ZONE_REVENUE = (() => {
  const map: Record<string, number> = {};
  MOCK_ORDERS.forEach((o) => {
    const zone = o.city || "Unknown";
    map[zone] = (map[zone] || 0) + o.total;
  });
  return Object.entries(map)
    .map(([zone, revenue]) => ({ zone, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
})();

const DRIVER_STATS = (() => {
  const map: Record<string, { deliveries: number; revenue: number }> = {};
  MOCK_ORDERS.filter((o) => o.driver).forEach((o) => {
    const d = o.driver!;
    if (!map[d]) map[d] = { deliveries: 0, revenue: 0 };
    map[d].deliveries += 1;
    map[d].revenue += o.total;
  });
  return Object.entries(map)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.deliveries - a.deliveries);
})();

const CHANNEL_SPLIT = (() => {
  const map: Record<string, number> = {};
  MOCK_ORDERS.forEach((o) => {
    const ch = o.channel === "web" ? "Website" : o.channel === "shopify" ? "Shopify" : "Marketplace";
    map[ch] = (map[ch] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
})();

/* ------------------------------------------------------------------ */
/*  Color palette for charts                                          */
/* ------------------------------------------------------------------ */
const DONUT_COLORS = [
  "#85afae", "#6f9c9b", "#10B981", "#F59E0B", "#06B6D4",
  "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
  "#6366F1", "#A855F7",
];

const CHANNEL_COLORS = ["#85afae", "#8B5CF6", "#F59E0B"];

type DateRange = "Today" | "7D" | "30D" | "QTD";

/* ------------------------------------------------------------------ */
/*  Stat Card (mini-KPI for top row)                                  */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: number;
  icon: typeof Package;
  tone: "primary" | "success" | "warning" | "danger" | "info" | "purple";
}) {
  const positive = change >= 0;
  const toneClasses: Record<string, { bg: string; text: string; glow: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary", glow: "bg-gradient-primary" },
    success: { bg: "bg-success/10", text: "text-success", glow: "bg-gradient-success" },
    warning: { bg: "bg-warning/10", text: "text-warning", glow: "bg-gradient-warning" },
    danger: { bg: "bg-destructive/10", text: "text-destructive", glow: "bg-gradient-danger" },
    info: { bg: "bg-info/10", text: "text-info", glow: "bg-gradient-info" },
    purple: { bg: "bg-[oklch(0.58_0.22_295)/0.1]", text: "text-[oklch(0.58_0.22_295)]", glow: "bg-gradient-primary" },
  };
  const t = toneClasses[tone];

  return (
    <div className="group relative rounded-2xl bg-card border border-border p-5 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5 overflow-hidden">
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-[0.08] blur-2xl ${t.glow}`} />
      <div className="flex items-start justify-between relative">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${t.bg}`}>
          <Icon className={`h-5 w-5 ${t.text}`} strokeWidth={2.2} />
        </div>
      </div>
      <div className="mt-4 relative">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <div
            className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 h-5 rounded-md ${
              positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Recharts tooltip                                           */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-elevated text-sm">
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize">{p.dataKey}:</span>
          <span className="font-semibold">{typeof p.value === "number" && p.dataKey.includes("revenue") ? `QAR ${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */
function ReportsPage() {
  const [range, setRange] = useState<DateRange>("7D");

  const totalOrders = MOCK_ORDERS.length;
  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
  const deliveredCount = MOCK_ORDERS.filter((o) => o.status === "Delivered").length;
  const failedCount = MOCK_ORDERS.filter((o) => o.status === "Delivery Failed").length;
  const deliveryRate = totalOrders > 0 ? ((deliveredCount / totalOrders) * 100).toFixed(1) : "0";
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-6 p-4 md:p-6">
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Business intelligence overview — orders, revenue, delivery performance & channel insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-soft">
                {(["Today", "7D", "30D", "QTD"] as DateRange[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setRange(p)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                      range === p
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                id="export-reports-btn"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-card border border-border text-sm font-medium shadow-soft hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* ── KPI Summary Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Total Orders" value={totalOrders.toLocaleString()} change={12.4} icon={Package} tone="primary" />
            <StatCard label="Total Revenue" value={`QAR ${totalRevenue.toLocaleString()}`} change={18.3} icon={DollarSign} tone="purple" />
            <StatCard label="Delivered" value={deliveredCount.toLocaleString()} change={8.2} icon={CheckCircle2} tone="success" />
            <StatCard label="Failed" value={failedCount.toLocaleString()} change={-22.5} icon={XCircle} tone="danger" />
            <StatCard label="Delivery Rate" value={`${deliveryRate}%`} change={3.1} icon={Truck} tone="info" />
            <StatCard label="Avg. Order Value" value={`QAR ${avgOrderValue}`} change={5.6} icon={ShoppingBag} tone="warning" />
          </div>

          {/* ── Orders Trend + Status Breakdown ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Area chart */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">Order Trends</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Daily orders & deliveries over the period</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Orders
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success" /> Delivered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" /> Failed
                  </span>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DAILY_ORDERS_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#85afae" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#85afae" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="deliveredFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="orders" stroke="#85afae" strokeWidth={2.5} fill="url(#ordersFill)" />
                    <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} fill="url(#deliveredFill)" />
                    <Area type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut chart — Status Breakdown */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-semibold">Status Breakdown</h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">Current order distribution</p>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={STATUS_BREAKDOWN}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {STATUS_BREAKDOWN.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-elevated text-sm">
                            <span className="font-medium">{payload[0].name}:</span>{" "}
                            <span className="font-bold">{payload[0].value}</span>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {STATUS_BREAKDOWN.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="ml-auto font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Revenue by Zone + Channel Split ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bar chart — Revenue by Zone */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">Revenue by Zone</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Top performing delivery zones</p>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ZONE_REVENUE} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#85afae" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6f9c9b" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="zone" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v >= 1000 ? `${v / 1000}K` : v}`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-elevated text-sm">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
                            <p className="font-bold text-foreground">QAR {payload[0].value?.toLocaleString()}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart — Channel Split */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-semibold">Channel Split</h2>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">Orders by sales channel</p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CHANNEL_SPLIT}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {CHANNEL_SPLIT.map((_, index) => (
                        <Cell key={`ch-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-elevated text-sm">
                            <span className="font-medium">{payload[0].name}:</span>{" "}
                            <span className="font-bold">{payload[0].value}</span>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {CHANNEL_SPLIT.map((ch, i) => {
                  const pct = ((ch.value / totalOrders) * 100).toFixed(0);
                  return (
                    <div key={ch.name} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }}
                      />
                      <span className="text-sm flex-1">{ch.name}</span>
                      <span className="text-sm font-semibold">{ch.value}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Driver Leaderboard ── */}
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-primary" />
                  Driver Leaderboard
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Performance ranking by delivery count</p>
              </div>
              <span className="text-xs text-muted-foreground">{DRIVER_STATS.length} drivers</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Deliveries
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Revenue Generated
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DRIVER_STATS.map((driver, idx) => {
                    const maxDeliveries = DRIVER_STATS[0]?.deliveries || 1;
                    const pct = (driver.deliveries / maxDeliveries) * 100;
                    return (
                      <tr
                        key={driver.name}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold ${
                              idx === 0
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                : idx === 1
                                  ? "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"
                                  : idx === 2
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center">
                              <span className="text-xs font-bold text-primary uppercase">
                                {driver.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium capitalize">{driver.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            <Truck className="h-3 w-3" /> {driver.deliveries}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold">
                          QAR {driver.revenue.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 w-48">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-[11px] text-muted-foreground py-4">
            Halamama LMD · RouteMyOrder · Reports generated from operational data · v2.4.1
          </footer>
        </main>
      </div>
    </div>
  );
}

