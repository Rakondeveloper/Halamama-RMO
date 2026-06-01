import { useState, useSyncExternalStore } from "react";
import { Barcode, Building2, CheckCircle2, Clock, Package, Truck, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { EnrichedOrder } from "@/lib/orders";
import { cn } from "@/lib/utils";
import {
  scheduleItem,
  removeItem,
  isItemScheduled,
  getSnapshot,
  subscribe,
} from "@/lib/scheduled-installations";
import { toast } from "sonner";

export function FulfillmentSection({ order }: { order: EnrichedOrder }) {
  const fcs = Array.from(new Set(order.itemsList.map((item) => item.fc)));

  // Subscribe to scheduled installations store for reactivity
  const scheduled = useSyncExternalStore(subscribe, getSnapshot);

  // Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<EnrichedOrder["itemsList"][number] | null>(null);

  const handleScheduleClick = (item: EnrichedOrder["itemsList"][number]) => {
    setPendingItem(item);
    setConfirmOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (!pendingItem) return;
    scheduleItem({
      orderId: order.id,
      productName: pendingItem.name,
      sku: pendingItem.sku,
      image: pendingItem.image,
      customerName: order.customer.name,
    });
    toast.success(`Installation scheduled for ${pendingItem.name}`);
    setConfirmOpen(false);
    setPendingItem(null);
  };

  const handleCancelSchedule = (orderId: string, sku: string) => {
    const entry = scheduled.find((s) => s.orderId === orderId && s.sku === sku);
    if (entry) {
      removeItem(entry.id);
      toast.info("Installation schedule removed");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Fulfillment</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.pickingStatus ?? "Picking pending"} | {order.packingStatus ?? "Packing pending"}
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-background sm:w-auto">
          <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Assign to Me
        </Button>
      </div>

      {fcs.map((fcId) => {
        const items = order.itemsList.filter((item) => item.fc === fcId);
        const fcName = items[0]?.fcName || fcId;

        return (
          <div
            key={fcId}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {fcId} - {fcName}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill
                  label="Preparation"
                  value={order.packingStatus ?? "Pending"}
                  tone="emerald"
                />
                <StatusPill
                  label="Delivery"
                  value={order.driverStatus ?? order.status}
                  tone="blue"
                />
              </div>
            </div>

            <div className="divide-y divide-border">
              {items.map((item) => {
                const itemIsScheduled = isItemScheduled(order.id, item.sku);

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 p-4 transition-colors hover:bg-muted/10 sm:grid-cols-[72px_1fr_auto] sm:p-5"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted/30 sm:h-[72px] sm:w-[72px]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 space-y-3">
                      <div>
                        <h4 className="font-semibold leading-snug text-foreground">{item.name}</h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                            <Package className="h-3 w-3" />
                            SKU {item.sku}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                            <Barcode className="h-3 w-3" />
                            Barcode {item.barcode}
                          </span>
                          {item.bin && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                              Bin {item.bin}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <ItemStatus status={item.status} />
                        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Truck className="h-3.5 w-3.5" />
                          {order.driverStatus ?? order.status}
                        </span>

                        {/* Schedule Installation / Scheduled status */}
                        {itemIsScheduled ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Scheduled
                            <button
                              type="button"
                              onClick={() => handleCancelSchedule(order.id, item.sku)}
                              className="ml-0.5 rounded-full p-0.5 cursor-pointer transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Cancel scheduled installation"
                            >
                              <X className="h-3 w-3 cursor-pointer" />
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleScheduleClick(item)}
                            className="inline-flex items-center gap-1.5 rounded-full cursor-pointer border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/50 hover:shadow-sm"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            Schedule installation
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-left sm:min-w-[150px] sm:text-right">
                      <div className="text-sm font-medium text-foreground">
                        QAR {item.price.toFixed(2)}{" "}
                        <span className="font-normal text-muted-foreground">x {item.qty}</span>
                      </div>
                      <div className="mt-1 text-base font-bold text-foreground">
                        QAR {(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Confirm Installation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
          <div className="p-7">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Confirm Installation
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1.5">
                Are you sure you want to schedule an installation for this item?
              </DialogDescription>
            </DialogHeader>

            {pendingItem && (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <img
                    src={pendingItem.image}
                    alt={pendingItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{pendingItem.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">SKU: {pendingItem.sku}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-7 py-5">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="w-full sm:w-auto rounded-xl font-semibold h-11 px-6 shadow-sm border-border/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSchedule}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md font-semibold h-11 px-8 transition-all"
            >
              Confirm Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "emerald";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "blue" &&
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
        tone === "emerald" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      {value}
    </span>
  );
}

function ItemStatus({ status }: { status: EnrichedOrder["itemsList"][number]["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "Prepared" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
        status === "Allocated" &&
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
        status === "Accepted" &&
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
        status === "Pending" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {status === "Prepared" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {status}
    </span>
  );
}
