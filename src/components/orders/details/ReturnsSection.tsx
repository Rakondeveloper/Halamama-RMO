import { ClipboardList, Plus, RotateCcw, Check, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnrichedOrder, ReturnStatus } from "@/lib/orders";
import { CreateReturnDialog } from "./CreateReturnDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { updateSharedOrder, broadcastChange } from "@/lib/sync";
import { toast } from "sonner";

const REASON_LABELS: Record<string, string> = {
  damaged: "Damaged / Defective",
  wrong: "Wrong Item Sent",
  expiry: "Near Expiry / Expired",
  mind: "Customer Changed Mind",
  other: "Other",
};

export function ReturnsSection({ order }: { order: EnrichedOrder }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const count = order.returnsList.length;

  const handleMarkReceived = (returnId: string) => {
    updateSharedOrder(order.id, (o) => {
      const ret = o.returnItems?.find((r) => r.id === returnId);
      if (ret) {
        ret.status = "completed";
        ret.completedAt = new Date().toISOString();
      }
    });
    broadcastChange();
    toast.success("Return marked as received at warehouse.");
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Returns / Collections</h2>
          {count > 0 ? (
            <span className="inline-flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 text-[11px] font-medium text-primary">
              {count}
            </span>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Return
        </Button>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            No returns or collections found
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create a return when an item needs collection, replacement, or refund tracking.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-center">Qty</th>
                  <th className="px-5 py-3">Collection Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {order.returnsList.map((ret) => (
                  <tr key={ret.id} className="transition-colors hover:bg-muted/10">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{ret.itemName}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{ret.sku || "—"}</div>
                      <div className="mt-1 inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        {ret.source}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {ret.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {ret.reason ? (REASON_LABELS[ret.reason] || ret.reason) : "—"}
                    </td>
                    <td className="px-5 py-3 text-center font-medium tabular-nums text-foreground">
                      {ret.qty}
                    </td>
                    <td className="px-5 py-3">
                      <ReturnStatusBadge status={ret.status} />
                      {ret.collectedAt && (
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          Collected: {new Date(ret.collectedAt).toLocaleDateString()}
                        </div>
                      )}
                      {ret.driverNote && (
                        <div className="mt-0.5 text-[10px] italic text-muted-foreground">
                          "{ret.driverNote}"
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {ret.status === "picked up" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-[11px] font-semibold"
                          onClick={() => handleMarkReceived(ret.id)}
                        >
                          <Check className="h-3 w-3" /> Mark Received
                        </Button>
                      )}
                      {ret.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                          <Truck className="h-3 w-3" /> Awaiting Pickup
                        </span>
                      )}
                      {ret.status === "completed" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <Check className="h-3 w-3" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border md:hidden">
            {order.returnsList.map((ret) => (
              <article key={ret.id} className="space-y-3 p-4">
                <div>
                  <h3 className="font-medium text-foreground">{ret.itemName}</h3>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{ret.sku || "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ret.source}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium uppercase text-muted-foreground">
                    {ret.type}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    Qty {ret.qty}
                  </span>
                  <ReturnStatusBadge status={ret.status} />
                </div>
                {ret.reason && (
                  <div className="text-xs text-muted-foreground">
                    Reason: {REASON_LABELS[ret.reason] || ret.reason}
                  </div>
                )}
                {ret.status === "picked up" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-[11px] font-semibold"
                    onClick={() => handleMarkReceived(ret.id)}
                  >
                    <Check className="h-3 w-3" /> Mark Received
                  </Button>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <CreateReturnDialog order={order} open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </section>
  );
}

function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        status === "pending" &&
          "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
        status === "picked up" &&
          "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
        status === "completed" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      )}
    >
      {status === "picked up" ? "Return Collected" : status}
    </span>
  );
}
