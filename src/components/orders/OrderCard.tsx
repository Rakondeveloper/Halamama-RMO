import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Order } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, Eye, MapPin, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function OrderCard({
  order,
  selected,
  onSelectChange,
  expanded,
  onToggleExpand,
  onViewOrder,
}: {
  order: Order;
  selected: boolean;
  onSelectChange: (next: boolean) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewOrder: (order: Order) => void;
}) {
  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-colors",
        expanded && "bg-muted/20",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-h-11 min-w-11 shrink-0 items-center justify-center pt-0.5">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectChange(v === true)}
            aria-label={`Select order ${order.id}`}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-mono text-sm font-semibold text-primary">{order.id}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                {order.date} · {order.time}
              </div>
            </div>
            <StatusBadge status={order.status} className="shrink-0" />
          </div>

          <div>
            <div className="font-semibold text-foreground">{order.customer.name}</div>
            <div className="truncate text-xs text-muted-foreground">{order.customer.email}</div>
            <div className="truncate text-xs text-muted-foreground tabular-nums">
              {order.customer.phone}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium tabular-nums">QAR {order.total.toFixed(2)}</span>
            <span className="text-muted-foreground">{order.items} items</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {order.city}
            </span>
          </div>

          {order.returns && (
            <div className="text-xs font-medium text-destructive">
              Return ×{order.returns.count}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 gap-1"
              onClick={() => onToggleExpand()}
              aria-expanded={expanded}
            >
              Details
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 gap-1 font-semibold shadow-sm"
              onClick={() => onViewOrder(order)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11 shrink-0"
              aria-label="More"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {expanded && (
            <div className="space-y-3 border-t border-border pt-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Driver
                  </div>
                  <div className="mt-1 font-medium">{order.driver ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Picker
                  </div>
                  <div className="mt-1 font-medium">{order.picker ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Packer
                  </div>
                  <div className="mt-1 font-medium">{order.packer ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    TAT
                  </div>
                  <div className="mt-1 font-medium tabular-nums">{order.tat}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Shopify: <span className="font-medium text-foreground">{order.status === "Delivered" ? "Fulfilled" : "Unfulfilled"}</span>
                {" · "}
                Channel: <span className="font-medium text-foreground">{order.channel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
