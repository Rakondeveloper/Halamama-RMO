import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { key: "new", label: "New Orders", count: 3, color: "status-new" },
  { key: "picked", label: "Picked", count: 3, color: "status-picked" },
  { key: "packed", label: "Packed", count: 2, color: "status-packed" },
  { key: "ready", label: "Ready to Assign", count: 4, color: "status-ready" },
  { key: "out", label: "Out for Delivery", count: 2, color: "status-out" },
  { key: "delivered", label: "Delivered", count: 3, color: "status-delivered" },
];

const pipelineTotal = stages.reduce((total, stage) => total + stage.count, 0);

export function PipelineTracker() {
  return (
    <section className="rounded-2xl bg-card border border-border shadow-soft p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Live Order Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time fulfillment workflow across warehouses
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          View kanban <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((s, i) => {
          const pct = (s.count / pipelineTotal) * 100;
          return (
            <button
              key={s.key}
              className="relative text-left rounded-xl bg-muted/40 hover:bg-muted/70 border border-transparent hover:border-border p-3.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn("h-2 w-2 rounded-full")}
                    style={{ backgroundColor: `var(--${s.color})` }}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Stage {i + 1}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{s.count}</div>
              <div className="text-[11px] text-muted-foreground truncate">{s.label}</div>
              <div className="mt-2.5 h-1.5 rounded-full bg-border/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: `var(--${s.color})`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
