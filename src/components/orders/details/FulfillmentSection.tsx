import { useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Barcode, Building2, CheckCircle2, Clock, Package, Truck, X, UserPlus, UserMinus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type EnrichedOrder, getPickerDisplayName, getItemPickerIdentifier } from "@/lib/orders";
import { assignItemPicker, assignRemainingItems, approveOrderForPicking, approveItemForPicking } from "@/lib/api/services";
import { getUsers } from "@/lib/sync";
import { cn } from "@/lib/utils";
import { orderKeys } from "@/hooks/useOrders";
import {
  scheduleItem,
  removeItem,
  isItemScheduled,
  getSnapshot,
  subscribe,
} from "@/lib/scheduled-installations";
import { toast } from "sonner";

const LOCATION_INFO: Record<
  string,
  { name: string; address: string; method: string; flow: string }
> = {
  F01: {
    name: "Fulfillment Center Hilal",
    address: "Street - 230, Zone - 42, Building No - 151, الدوحة, Qatar",
    method: "Standard Assembly (Hilal Team)",
    flow: "Picker App Flow",
  },
  F02: {
    name: "Main Warehouse - Safety Stock",
    address: "Birkat Al Awamer, Birkat Al Awamer, Qatar",
    method: "Standard Safety Stock Allocation",
    flow: "Warehouse Direct Flow",
  },
  MWO: {
    name: "Main Warehouse Outdoor",
    address: "Birkat Al Awamer, Birkat Al Awamer, Qatar",
    method: "Main Warehouse Outdoor Installation (Specialist Team)",
    flow: "Warehouse Direct Flow",
  },
  VS: {
    name: "Virtual Stock",
    address: "Qatar",
    method: "Virtual Stock Direct Delivery & Setup (Third-Party Partner)",
    flow: "Warehouse Direct Flow",
  },
};

export function FulfillmentSection({ order }: { order: EnrichedOrder }) {
  const queryClient = useQueryClient();
  const rawItemsList = order.itemsList || [];
  const fcs = Array.from(new Set(rawItemsList.map((item) => item.fc || "F01")));

  // Map each item ID to its global 1-based sequential item index in the order
  const itemIndexMap = new Map<string, number>(
    rawItemsList.map((item, idx) => [item.id, idx + 1])
  );

  // Subscribe to scheduled installations store for reactivity
  const scheduled = useSyncExternalStore(subscribe, getSnapshot);

  // Dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<EnrichedOrder["itemsList"][number] | null>(null);

  // Cancel Dialog state
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<EnrichedOrder["itemsList"][number] | null>(null);

  // Unassign Dialog state
  const [unassignConfirmOpen, setUnassignConfirmOpen] = useState(false);
  const [itemToUnassign, setItemToUnassign] = useState<EnrichedOrder["itemsList"][number] | null>(null);

  // Assign Dialog state
  const [assignConfirmOpen, setAssignConfirmOpen] = useState(false);
  const [itemToAssign, setItemToAssign] = useState<EnrichedOrder["itemsList"][number] | null>(null);
  const [selectedPickerToAssign, setSelectedPickerToAssign] = useState<{ email: string; name: string } | null>(null);

  const handleSelectPickerOption = (
    item: EnrichedOrder["itemsList"][number],
    pickerEmail: string,
    pickerName: string
  ) => {
    setItemToAssign(item);
    setSelectedPickerToAssign({ email: pickerEmail, name: pickerName });
    setAssignConfirmOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (itemToAssign && selectedPickerToAssign) {
      const targetId = itemToAssign.id || itemToAssign.sku;
      const { email: pEmail, name: pName } = selectedPickerToAssign;

      // Optimistically update query data for immediate re-render
      queryClient.setQueryData(orderKeys.detail(order.id), (oldOrder: EnrichedOrder | undefined) => {
        if (!oldOrder || !oldOrder.itemsList) return oldOrder;
        const newItems = oldOrder.itemsList.map((item) => {
          if (item.id === targetId || item.sku === targetId) {
            const updated = { ...item };
            if (pEmail === "any") {
              updated.pickedBy = "any";
              updated.pickerName = "Any Picker";
            } else {
              updated.pickedBy = pEmail;
              updated.pickerName = pName;
            }
            return updated;
          }
          return item;
        });
        const pickers = Array.from(
          new Set(
            newItems
              .map((i) => i.pickerName || i.pickedBy)
              .filter((p): p is string => Boolean(p))
          )
        );
        return {
          ...oldOrder,
          itemsList: newItems,
          picker: pickers.length > 0 ? pickers.join(", ") : undefined,
        };
      });

      await assignItemPicker(order.id, targetId, pEmail, pName);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      if (pEmail === "any") {
        toast.success(`Assigned ${itemToAssign.name} to Any Picker (Open to All)`);
      } else {
        toast.success(`Assigned ${itemToAssign.name} to ${pName}`);
      }
    }
    setAssignConfirmOpen(false);
    setItemToAssign(null);
    setSelectedPickerToAssign(null);
  };

  const handleUnassignClick = (item: EnrichedOrder["itemsList"][number]) => {
    setItemToUnassign(item);
    setUnassignConfirmOpen(true);
  };

  const handleConfirmUnassign = async () => {
    if (itemToUnassign) {
      const pName = getPickerDisplayName(getItemPickerIdentifier(itemToUnassign));
      const targetId = itemToUnassign.id || itemToUnassign.sku;

      // Optimistically update query data for immediate re-render
      queryClient.setQueryData(orderKeys.detail(order.id), (oldOrder: EnrichedOrder | undefined) => {
        if (!oldOrder || !oldOrder.itemsList) return oldOrder;
        const newItems = oldOrder.itemsList.map((item) => {
          if (item.id === targetId || item.sku === targetId) {
            const updated = { ...item };
            delete updated.pickedBy;
            delete updated.pickerName;
            return updated;
          }
          return item;
        });
        const remainingPickers = Array.from(
          new Set(
            newItems
              .map((i) => i.pickerName || i.pickedBy)
              .filter((p): p is string => Boolean(p))
          )
        );
        return {
          ...oldOrder,
          itemsList: newItems,
          picker: remainingPickers.length > 0 ? remainingPickers.join(", ") : undefined,
        };
      });

      await assignItemPicker(order.id, targetId, "", "");
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.info(`Unassigned ${pName} from ${itemToUnassign.name}`);
    }
    setUnassignConfirmOpen(false);
    setItemToUnassign(null);
  };

  const handleScheduleClick = (item: EnrichedOrder["itemsList"][number]) => {
    setPendingItem(item);
    setConfirmOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (!pendingItem) return;
    const info = LOCATION_INFO[pendingItem.fc] || { method: "Standard Assembly (Hilal Team)" };
    scheduleItem({
      orderId: order.id,
      productName: pendingItem.name,
      sku: pendingItem.sku,
      image: pendingItem.image,
      customerName: order.customer.name,
      installationMethod: info.method,
    });
    toast.success(`Installation scheduled for ${pendingItem.name}`);
    setConfirmOpen(false);
    setPendingItem(null);
  };

  const handleCancelClick = (item: EnrichedOrder["itemsList"][number]) => {
    setItemToCancel(item);
    setCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!itemToCancel) return;
    const entry = scheduled.find((s) => s.orderId === order.id && s.sku === itemToCancel.sku);
    if (entry) {
      removeItem(entry.id);
      toast.info("Installation schedule removed");
    }
    setCancelConfirmOpen(false);
    setItemToCancel(null);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        {fcs.map((fcId) => {
          const items = rawItemsList.filter((item) => (item.fc || "F01") === fcId);
          const info = LOCATION_INFO[fcId] || {
            name: items[0]?.fcName || fcId,
            address: "Qatar",
            method: "Standard Assembly (Hilal Team)",
            flow: "Warehouse Direct Flow",
          };

          return (
            <div
              key={fcId}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {fcId} - {info.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic pl-6 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{info.address}</span>
                    <span className="hidden sm:inline text-muted-foreground/40">•</span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-border">Method: {info.method}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Aggregate Picking Progress & Actions for this FC */}
                  {(() => {
                    const pickedCount = items.filter((i) => i.status === "Prepared" || i.status === "Picked").length;
                    const totalCount = items.length;
                    const isAllPicked = pickedCount === totalCount;
                      return (
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border",
                          isAllPicked
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                        )}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {pickedCount}/{totalCount} Items Picked
                        </span>
                      );
                    })()}
                </div>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => {
                  const itemIsScheduled = isItemScheduled(order.id, item.sku);
                  const itemIndex = itemIndexMap.get(item.id) ?? 1;
                  const isPicked = item.status === "Prepared" || item.status === "Picked";
                  const isSpecificAssigned = Boolean(
                    (item.pickedBy && item.pickedBy !== "any") ||
                    (item.pickerName && item.pickerName !== "Any Picker")
                  );

                  return (
                    <article
                      key={item.id}
                      className={cn(
                        "grid gap-4 p-4 transition-colors sm:grid-cols-[auto_72px_1fr_auto] sm:items-center sm:p-5 border-l-4",
                        isPicked
                          ? "border-l-emerald-500 bg-emerald-50/25 hover:bg-emerald-50/35 dark:border-l-emerald-400 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20"
                          : isSpecificAssigned
                          ? "border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/30 dark:border-l-amber-400 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
                          : "border-l-slate-400 bg-slate-50/40 hover:bg-slate-50/60 dark:border-l-slate-600 dark:bg-slate-900/10 dark:hover:bg-slate-900/20"
                      )}
                    >
                      {/* Serial Number Badge (in front of photo, shown only once) */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs dark:bg-slate-100 dark:text-slate-950 shrink-0 self-center">
                        #{itemIndex}
                      </div>

                      {/* Product Thumbnail */}
                      <div className="h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted/30 sm:h-[72px] sm:w-[72px] shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div className="space-y-1">
                          <h4 className="font-semibold leading-snug text-foreground">{item.name}</h4>
                        </div>

                        <div className="flex flex-col gap-0.5 mt-1">
                          {item.sku && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.sku}
                            </p>
                          )}
                          {item.barcode && (
                            <p className="text-xs text-muted-foreground">
                              Barcode: {item.barcode}
                            </p>
                          )}
                          {item.serialNumber && (
                            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                              <span>Serial No:</span>
                              <span className="font-semibold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border text-[11px] select-all">
                                {item.serialNumber}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 sm:flex-nowrap">
                          {/* Fulfillment status — always visible */}
                          <ItemStatus status={item.status} isAssigned={isSpecificAssigned} />

                          {/* Item Picker Badge / Dropdown Action */}
                          {isPicked ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-semibold shrink-0 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                              <Package className="h-3.5 w-3.5" />
                              Picker: {getPickerDisplayName(getItemPickerIdentifier(item))}
                            </span>
                          ) : isSpecificAssigned ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-semibold shrink-0 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                                <Package className="h-3.5 w-3.5" />
                                Picker: {getPickerDisplayName(getItemPickerIdentifier(item))}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUnassignClick(item)}
                                className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400"
                                title="Unassign picker from this item"
                              >
                                <UserMinus className="h-3.5 w-3.5 text-rose-500" />
                                <span>Unassign</span>
                              </button>
                            </div>
                          ) : (
                            <Select
                              onValueChange={(value) => {
                                if (!value) return;
                                if (value === "any") {
                                  handleSelectPickerOption(item, "any", "Any Picker");
                                  return;
                                }
                                const pickerMap: Record<string, string> = {
                                  "picker@rmo.qa": "Ahmed Khalil",
                                  "nijad@rmo.qa": "Nijad",
                                  "mashood@rmo.qa": "Mashood",
                                  "packer@rmo.qa": "Sara Al-Thani",
                                };
                                const pName = pickerMap[value] || value.split("@")[0];
                                handleSelectPickerOption(item, value, pName);
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs font-semibold border border-rose-300 text-rose-700 bg-rose-50/70 hover:bg-rose-100 rounded-full px-3 gap-1.5 cursor-pointer w-auto inline-flex shrink-0 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Assign to Picker</span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any" className="font-semibold text-purple-700 dark:text-purple-400">
                                  Any Picker
                                </SelectItem>
                                {getUsers()
                                  .filter((u) => u.role === "picker" && u.status === "active")
                                  .map((p) => (
                                    <SelectItem key={p.id} value={p.email}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Installation status — shown alongside fulfillment */}
                          {itemIsScheduled ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Scheduled
                              <button
                                type="button"
                                onClick={() => handleCancelClick(item)}
                                className="ml-0.5 rounded-full p-0.5 cursor-pointer transition-colors hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Cancel scheduled installation"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleScheduleClick(item)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm transition-all hover:bg-muted"
                            >
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              Schedule
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
      </div>

      {/* Confirm Installation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[480px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
          <div className="p-5 sm:p-7">
            <DialogHeader className="mb-5 text-center sm:text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                Confirm Installation
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                Are you sure you want to schedule an installation for this item?
              </DialogDescription>
            </DialogHeader>

            {pendingItem && (
              <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <img
                    src={pendingItem.image}
                    alt={pendingItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">{pendingItem.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">SKU: {pendingItem.sku}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-5 sm:px-7 py-4 sm:py-5">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="w-full sm:w-auto rounded-xl font-semibold h-10 sm:h-11 text-xs sm:text-sm shadow-sm border-border/60 text-slate-800 dark:text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSchedule}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md font-semibold h-10 sm:h-11 text-xs sm:text-sm px-8 transition-all"
            >
              Confirm Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[480px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
          <div className="p-5 sm:p-7">
            <DialogHeader className="mb-5 text-center sm:text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-destructive">
                Remove Installation
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                Are you sure you want to remove the scheduled installation for this item?
              </DialogDescription>
            </DialogHeader>

            {itemToCancel && (
              <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <img
                    src={itemToCancel.image}
                    alt={itemToCancel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">{itemToCancel.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">SKU: {itemToCancel.sku}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-5 sm:px-7 py-4 sm:py-5">
            <Button
              variant="outline"
              onClick={() => setCancelConfirmOpen(false)}
              className="w-full sm:w-auto rounded-xl font-semibold h-10 sm:h-11 text-xs sm:text-sm shadow-sm border-border/60 text-slate-800 dark:text-slate-200"
            >
              Keep Scheduled
            </Button>
            <Button
              onClick={handleConfirmCancel}
              className="w-full sm:w-auto rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md font-semibold h-10 sm:h-11 text-xs sm:text-sm px-8 transition-all"
            >
              Remove Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Unassign Picker Dialog */}
      <Dialog open={unassignConfirmOpen} onOpenChange={setUnassignConfirmOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[480px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
          <div className="p-5 sm:p-7">
            <DialogHeader className="mb-5 text-center sm:text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                Unassign Picker?
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Are you sure you want to unassign{" "}
                <strong className="text-foreground">
                  {getPickerDisplayName(getItemPickerIdentifier(itemToUnassign))}
                </strong>{" "}
                from this item?
              </DialogDescription>
            </DialogHeader>

            {itemToUnassign && (
              <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <img
                    src={itemToUnassign.image}
                    alt={itemToUnassign.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">{itemToUnassign.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">SKU: {itemToUnassign.sku}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                      Picker: {getPickerDisplayName(getItemPickerIdentifier(itemToUnassign))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-5 sm:px-7 py-4 sm:py-5">
            <Button
              variant="outline"
              onClick={() => {
                setUnassignConfirmOpen(false);
                setItemToUnassign(null);
              }}
              className="w-full sm:w-auto rounded-xl font-semibold h-10 sm:h-11 text-xs sm:text-sm shadow-sm border-border/60 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUnassign}
              className="w-full sm:w-auto rounded-xl bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700 shadow-md font-semibold h-10 sm:h-11 text-xs sm:text-sm px-6 transition-all cursor-pointer"
            >
              Confirm Unassign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Assign Picker Dialog */}
      <Dialog open={assignConfirmOpen} onOpenChange={setAssignConfirmOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[480px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
          <div className="p-5 sm:p-7">
            <DialogHeader className="mb-5 text-center sm:text-left">
              <DialogTitle className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight",
                selectedPickerToAssign?.email === "any"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-rose-600 dark:text-rose-400"
              )}>
                {selectedPickerToAssign?.email === "any"
                  ? "Make Available to All Pickers?"
                  : "Assign Picker?"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {selectedPickerToAssign?.email === "any" ? (
                  <>Are you sure you want to make this item available to all pickers?</>
                ) : (
                  <>
                    Are you sure you want to assign{" "}
                    <strong className="text-foreground font-semibold">
                      {selectedPickerToAssign?.name}
                    </strong>{" "}
                    to this item?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {itemToAssign && selectedPickerToAssign && (
              <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <img
                    src={itemToAssign.image}
                    alt={itemToAssign.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">{itemToAssign.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">SKU: {itemToAssign.sku}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      selectedPickerToAssign.email === "any"
                        ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-400"
                        : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                    )}>
                      Picker: {selectedPickerToAssign.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-5 sm:px-7 py-4 sm:py-5">
            <Button
              variant="outline"
              onClick={() => {
                setAssignConfirmOpen(false);
                setItemToAssign(null);
                setSelectedPickerToAssign(null);
              }}
              className="w-full sm:w-auto rounded-xl font-semibold h-10 sm:h-11 text-xs sm:text-sm shadow-sm border-border/60 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssign}
              className={cn(
                "w-full sm:w-auto rounded-xl text-white shadow-md font-semibold h-10 sm:h-11 text-xs sm:text-sm px-6 transition-all cursor-pointer",
                selectedPickerToAssign?.email === "any"
                  ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
                  : "bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
              )}
            >
              Confirm Assignment
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

function ItemStatus({
  status,
  isAssigned,
}: {
  status: EnrichedOrder["itemsList"][number]["status"];
  isAssigned: boolean;
}) {
  const isPicked = status === "Prepared" || status === "Picked";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all",
        isPicked &&
          "border-emerald-300 bg-emerald-100/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
        !isPicked && isAssigned &&
          "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
        !isPicked && !isAssigned &&
          "border-slate-300 bg-slate-100/90 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      {isPicked ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Picked</span>
        </>
      ) : isAssigned ? (
        <>
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Pending Pick (Assigned)</span>
        </>
      ) : (
        <>
          <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span>Pending Pick (Unassigned)</span>
        </>
      )}
    </span>
  );
}
