import { AlertTriangle, PackageX, PhoneOff, Clock, Flame, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const flags = [
  {
    icon: PhoneOff,
    title: "Customer unreachable",
    order: "HLM-10245",
    driver: "Tareq F.",
    priority: "high",
    time: "2m ago",
  },
  {
    icon: PackageX,
    title: "Damaged item reported",
    order: "HLM-10231",
    driver: "Bilal H.",
    priority: "high",
    time: "14m ago",
  },
  {
    icon: Clock,
    title: "Delivery TAT exceeded",
    order: "HLM-10218",
    driver: "Karim S.",
    priority: "med",
    time: "23m ago",
  },
  {
    icon: AlertTriangle,
    title: "Missing item flagged by picker",
    order: "HLM-10209",
    driver: "—",
    priority: "med",
    time: "41m ago",
  },
];

const priorityMap = {
  high: { bg: "bg-destructive/10", text: "text-destructive", border: "border-l-destructive" },
  med: { bg: "bg-warning/10", text: "text-warning", border: "border-l-warning" },
};

export function FlagsPanel() {
  return (
    <section className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 grid place-items-center">
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Flags & Exceptions</h2>
            <p className="text-[11px] text-muted-foreground">7 active alerts requiring attention</p>
          </div>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">View all</button>
      </div>
      <div className="divide-y divide-border">
        {flags.map((f, i) => {
          const p = priorityMap[f.priority as keyof typeof priorityMap];
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors border-l-2",
                p.border,
              )}
            >
              <div
                className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0 mt-0.5", p.bg)}
              >
                <Icon className={cn("h-4 w-4", p.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold">{f.title}</span>
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider font-bold px-1.5 h-4 rounded grid place-items-center",
                      p.bg,
                      p.text,
                    )}
                  >
                    {f.priority}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span className="font-mono font-medium">{f.order}</span>
                  <span>·</span>
                  <span>{f.driver}</span>
                  <span>·</span>
                  <span>{f.time}</span>
                </div>
              </div>
              <button className="h-7 px-2.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors flex items-center gap-0.5">
                Resolve <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
