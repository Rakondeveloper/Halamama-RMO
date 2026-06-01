import { ClipboardList, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnrichedOrder } from "@/lib/orders";
import { CreateReturnDialog } from "./CreateReturnDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ReturnsSection({ order }: { order: EnrichedOrder }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const count = order.returnsList.length;

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
                  <th className="px-5 py-3 text-center">Qty</th>
                  <th className="px-5 py-3">Collection status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {order.returnsList.map((ret) => (
                  <tr key={ret.id} className="transition-colors hover:bg-muted/10">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{ret.itemName}</div>
                      <div className="mt-1 inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        {ret.source}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {ret.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-medium tabular-nums text-foreground">
                      {ret.qty}
                    </td>
                    <td className="px-5 py-3">
                      <ReturnStatus status={ret.status} />
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
                  <p className="mt-1 text-xs text-muted-foreground">{ret.source}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium uppercase text-muted-foreground">
                    {ret.type}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    Qty {ret.qty}
                  </span>
                  <ReturnStatus status={ret.status} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <CreateReturnDialog order={order} open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </section>
  );
}

function ReturnStatus({ status }: { status: EnrichedOrder["returnsList"][number]["status"] }) {
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
      {status}
    </span>
  );
}
