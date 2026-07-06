import { type LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  icon: LucideIcon;
  spark: number[];
  tone?: "primary" | "success" | "warning" | "info" | "danger" | "purple";
  pulse?: boolean;
}

const toneMap = {
  primary: {
    grad: "from-[#85afae]/20 to-[#85afae]/5",
    text: "text-primary",
    soft: "bg-primary/10",
    ring: "ring-primary/20",
    stroke: "stroke-primary",
    glow: "shadow-[0_0_20px_rgba(133,175,174,0.15)]",
  },
  success: {
    grad: "from-emerald-500/20 to-emerald-500/5",
    text: "text-success",
    soft: "bg-success/10",
    ring: "ring-success/20",
    stroke: "stroke-success",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  warning: {
    grad: "from-amber-500/20 to-amber-500/5",
    text: "text-warning",
    soft: "bg-warning/10",
    ring: "ring-warning/20",
    stroke: "stroke-warning",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
  info: {
    grad: "from-cyan-500/20 to-cyan-500/5",
    text: "text-info",
    soft: "bg-info/10",
    ring: "ring-info/20",
    stroke: "stroke-info",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  },
  danger: {
    grad: "from-red-500/20 to-red-500/5",
    text: "text-destructive",
    soft: "bg-destructive/10",
    ring: "ring-destructive/20",
    stroke: "stroke-destructive",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  },
  purple: {
    grad: "from-violet-500/20 to-violet-500/5",
    text: "text-violet-600 dark:text-violet-400",
    soft: "bg-violet-500/10",
    ring: "ring-violet-500/20",
    stroke: "stroke-violet-500",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  },
};

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 120,
    h = 24;
  const max = Math.max(...data),
    min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("w-full h-6", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill="url(#spark-fill)"
        stroke="none"
      />
      <polyline
        points={pts}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  spark,
  tone = "primary",
  pulse,
}: KpiCardProps) {
  const t = toneMap[tone];
  const positive = change >= 0;
  return (
    <div className={cn(
      "group relative rounded-2xl p-3 sm:p-4 premium-card overflow-hidden cursor-default",
      "hover:!shadow-elevated",
      t.glow,
    )}>
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          t.grad,
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn(
            "h-8 w-8 rounded-xl grid place-items-center ring-1 transition-all duration-300 group-hover:scale-110",
            t.soft,
            t.ring,
          )}>
            <Icon className={cn("h-4 w-4", t.text)} strokeWidth={2.2} />
          </div>
          {pulse && (
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
          )}
        </div>

        <div className="mt-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-xl font-bold tracking-tight">{value}</div>
            <div
              className={cn(
                "flex items-center gap-0.5 text-[11px] font-semibold px-1.5 h-5 rounded-md",
                positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(change)}%
            </div>
          </div>
        </div>

        <div className={cn("mt-2 -mx-1", t.text)}>
          <Sparkline data={spark} />
        </div>
      </div>
    </div>
  );
}
