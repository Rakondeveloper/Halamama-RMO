
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneIcon: Record<string, string> = {
  primary: "text-primary",
  info: "text-sky-600 dark:text-sky-400",
  warning: "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  violet: "text-violet-600 dark:text-violet-400",
};

const toneBgClass: Record<string, string> = {
  primary: "bg-primary/10",
  info: "bg-sky-500/10",
  warning: "bg-amber-500/10",
  success: "bg-emerald-500/10",
  violet: "bg-violet-500/10",
};

export function OrdersHeader({
  stats,
}: {
  stats: { label: string; value: string; icon: LucideIcon; tone: keyof typeof toneIcon }[];
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">Orders</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {stats.map((s) => (
            <div 
              key={s.label} 
              className="flex items-center gap-2.5 rounded-xl border bg-card/50 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/50"
            >
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", toneBgClass[s.tone])}>
                <s.icon className={cn("h-4 w-4", toneIcon[s.tone])} aria-hidden />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold tabular-nums tracking-tight text-foreground">{s.value}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
