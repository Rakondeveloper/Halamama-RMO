import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
    grad: "bg-gradient-primary",
    text: "text-primary",
    soft: "bg-primary/10",
    stroke: "stroke-primary",
  },
  success: {
    grad: "bg-gradient-success",
    text: "text-success",
    soft: "bg-success/10",
    stroke: "stroke-success",
  },
  warning: {
    grad: "bg-gradient-warning",
    text: "text-warning",
    soft: "bg-warning/10",
    stroke: "stroke-warning",
  },
  info: { grad: "bg-gradient-info", text: "text-info", soft: "bg-info/10", stroke: "stroke-info" },
  danger: {
    grad: "bg-gradient-danger",
    text: "text-destructive",
    soft: "bg-destructive/10",
    stroke: "stroke-destructive",
  },
  purple: {
    grad: "bg-gradient-primary",
    text: "text-[oklch(0.58_0.22_295)]",
    soft: "bg-[oklch(0.58_0.22_295)/0.1]",
    stroke: "stroke-[oklch(0.58_0.22_295)]",
  },
};

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 100,
    h = 32;
  const max = Math.max(...data),
    min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("w-full h-8", className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        className="fill-current opacity-10"
        stroke="none"
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
    <div className="group relative rounded-2xl bg-card border border-border p-5 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5 overflow-hidden">
      <div
        className={cn(
          "absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-[0.08] blur-2xl",
          t.grad,
        )}
      />

      <div className="flex items-start justify-between">
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", t.soft)}>
          <Icon className={cn("h-5 w-5", t.text)} strokeWidth={2.2} />
        </div>
        {pulse && (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
          </span>
        )}
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
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

      <div className={cn("mt-3 -mx-1", t.text)}>
        <Sparkline data={spark} />
      </div>
    </div>
  );
}
