import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDisplayTat, tatColorClass, getOrderItemsCount, getPickerDisplayName, getUserDisplayName, type Order } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Package, Truck, User, Eye, MessageSquare, Trash2, Plus, Check, UserCheck } from "lucide-react";
import { useUpdateOrderComment, useDeleteOrderComment } from "@/hooks/useOrders";
import { toast } from "sonner";
import { CrewTag } from "./CrewTag";
import { DriverStatusBadge } from "./DriverStatusBadge";
import { DeliveryDateCell } from "./DeliveryDateCell";
import { StatusBadge } from "./StatusBadge";

export function CommentCell({ order }: { order: Order }) {
  const updateComment = useUpdateOrderComment();
  const deleteComment = useDeleteOrderComment();

  const currentComment = order.comment || (order.coordinator && order.coordinator !== "-" ? order.coordinator : "");
  const currentAdmin = order.commentMeta?.editedBy || "Suhail (Ops Admin)";

  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState(currentComment);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setCommentText(currentComment);
    }
    setIsOpen(open);
  };

  const handleSave = () => {
    if (!commentText.trim()) {
      handleDelete();
      return;
    }
    updateComment.mutate(
      {
        orderId: order.id,
        commentText: commentText.trim(),
        adminName: currentAdmin,
      },
      {
        onSuccess: () => {
          toast.success("Comment updated successfully");
          setIsOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteComment.mutate(order.id, {
      onSuccess: () => {
        toast.success("Comment removed");
        setCommentText("");
        setIsOpen(false);
      },
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "group/cmd text-left flex flex-col justify-center rounded-lg p-1.5 transition-all cursor-pointer hover:bg-accent/60 max-w-[170px]",
            !currentComment && "border border-dashed border-border/70 hover:border-primary/40 px-2 py-1"
          )}
        >
          {currentComment ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground truncate max-w-[130px]" title={currentComment}>
                  {currentComment}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1 truncate">
                <UserCheck className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {order.commentMeta?.editedBy ? order.commentMeta.editedBy : "Ops Admin"}
                </span>
                {order.commentMeta?.editedAt && (
                  <span className="opacity-70 text-[9px] shrink-0">• {order.commentMeta.editedAt.split(",")[0]}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/70 group-hover/cmd:text-primary transition-colors">
              <Plus className="h-3 w-3" />
              <span>Add Comment</span>
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyDownCapture={(e) => e.stopPropagation()}
        className="w-80 p-4 space-y-3 shadow-xl rounded-xl border border-border bg-card"
        align="start"
      >
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Order Comment</h4>
          </div>
          <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            #{order.id}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Comment Text</span>
          </label>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyDownCapture={(e) => e.stopPropagation()}
            placeholder="Type operations comment here..."
            className="text-xs min-h-[80px] resize-none rounded-lg focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <UserCheck className="h-3 w-3 text-muted-foreground" />
            <span>Operation Admin</span>
          </label>
          <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border/50">
            <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{currentAdmin}</span>
          </div>
        </div>

        {order.commentMeta && (
          <div className="text-[10px] bg-muted/40 rounded-lg p-2 text-muted-foreground space-y-0.5">
            <div><span className="font-semibold">Last edited by:</span> {order.commentMeta.editedBy}</div>
            <div><span className="font-semibold">Time:</span> {order.commentMeta.editedAt}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border">
          {currentComment ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 text-xs rounded-lg px-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateComment.isPending}
              className="h-8 text-xs rounded-lg px-3 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ShopifyBadge({ status }: { status: Order["shopify"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        status === "Fulfilled" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        status === "Unfulfilled" &&
          "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
        status === "Pending" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          status === "Fulfilled" && "bg-emerald-500",
          status === "Unfulfilled" && "bg-gray-400",
          status === "Pending" && "bg-amber-500",
        )}
        aria-hidden
      />
      {status}
    </span>
  );
}

function ReturnBadge({ order }: { order: Order }) {
  const items = order.returnItems ?? [];
  const count = items.length || order.returns?.count || 0;
  if (count === 0) return null;

  // If all items are collected/completed, show green badge
  if (items.length > 0 && items.every((r) => r.status === "picked up" || r.status === "completed")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Return Collected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M6 2v4M6 8v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Return ({count})
    </span>
  );
}

function DriverCell({ order }: { order: Order }) {
  if (!order.driver) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20">
          Unassigned
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <CrewTag
        name={getUserDisplayName(order.driver)}
        Icon={Truck}
        color="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
      />
      <DriverStatusBadge status={order.driverStatus} />
    </div>
  );
}

function getOrderPickers(order: Order): string[] {
  const itemPickers = order.itemsList
    ? Array.from(
        new Set(
          order.itemsList
            .map((i) => i.pickerName || (i.pickedBy ? getPickerDisplayName(i.pickedBy) : null))
            .filter((p): p is string => Boolean(p))
        )
      )
    : [];
  if (itemPickers.length > 0) {
    return itemPickers;
  }
  if (order.picker) {
    return order.picker.split(",").map((p) => getPickerDisplayName(p.trim()));
  }
  return [];
}

function PickerCell({ order }: { order: Order }) {
  const pickers = getOrderPickers(order);
  if (pickers.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {pickers.map((pName, idx) => (
        <CrewTag
          key={idx}
          name={pName}
          Icon={User}
          color="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
        />
      ))}
    </div>
  );
}

function PackerCell({ order }: { order: Order }) {
  if (!order.packer) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <CrewTag
      name={getUserDisplayName(order.packer)}
      Icon={Package}
      color="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
    />
  );
}

function getActiveCrewForStage(order: Order): {
  type: "picker" | "packer" | "driver" | null;
  name: string | null;
} {
  const pickers = getOrderPickers(order);
  const pickerName = pickers.length > 0 ? pickers.join(", ") : null;
  const packerName = getUserDisplayName(order.packer);
  const driverName = getUserDisplayName(order.driver);

  switch (order.status) {
    case "Picking":
    case "Picked":
      return pickerName ? { type: "picker", name: pickerName } : { type: null, name: null };

    case "Packing":
      return packerName ? { type: "packer", name: packerName } : { type: null, name: null };

    case "Ready to Assign":
      if (driverName) return { type: "driver", name: driverName };
      if (packerName) return { type: "packer", name: packerName };
      return { type: null, name: null };

    case "Driver Accepted":
    case "Started":
    case "Delivered":
    case "Delivery Failed":
      return driverName ? { type: "driver", name: driverName } : { type: null, name: null };

    default:
      if (driverName) return { type: "driver", name: driverName };
      if (packerName) return { type: "packer", name: packerName };
      if (pickerName) return { type: "picker", name: pickerName };
      return { type: null, name: null };
  }
}

function AllStatusCell({ order }: { order: Order }) {
  const activeCrew = getActiveCrewForStage(order);

  return (
    <div className="flex flex-col items-start gap-1 py-1 min-w-[150px]">
      {/* Primary Status Badge */}
      <StatusBadge status={order.status} className="font-semibold text-xs" />

      {/* Active Stage Crew Member Only (hides expired stage crew and unassigned placeholders) */}
      {activeCrew.type === "picker" && activeCrew.name && (
        <CrewTag name={`Picker: ${activeCrew.name}`} Icon={User} color="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" />
      )}

      {activeCrew.type === "packer" && activeCrew.name && (
        <CrewTag name={`Packer: ${activeCrew.name}`} Icon={Package} color="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" />
      )}

      {activeCrew.type === "driver" && activeCrew.name && (
        <div className="flex flex-wrap items-center gap-1">
          <CrewTag name={`Driver: ${activeCrew.name}`} Icon={Truck} color="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" />
          <DriverStatusBadge status={order.driverStatus} />
        </div>
      )}
    </div>
  );
}

export function OrderTableRow({
  order,
  selected,
  onSelectChange,
  expanded,
  onToggleExpand,
  onViewOrder,
  dynamicCol,
  activeTab,
}: {
  order: Order;
  selected: boolean;
  onSelectChange: (next: boolean) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewOrder: (order: Order) => void;
  dynamicCol: "driver" | "picker" | "packer" | "all_status" | null;
  activeTab?: string;
}) {
  const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
    const el = e.target as HTMLElement;
    if (el.closest("button, [role='checkbox'], a, input, textarea, select, [data-row-ignore], [data-radix-popper-content-wrapper]")) return;
    onToggleExpand();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      const t = e.target as HTMLElement;
      if (t.closest("button, [role='checkbox'], textarea, input, select, [data-radix-popper-content-wrapper]")) return;
      e.preventDefault();
      onToggleExpand();
    }
  };

  const displayTat = getDisplayTat(order, activeTab);
  const tatClass = tatColorClass(displayTat);
  const isPickingOrPicked = activeTab === "Picking" || activeTab === "Picked";
  const isPacking = activeTab === "Packing";
  const isNewOrAllTab = activeTab === "New" || activeTab === "All";
  const colSpanCount = isPacking
    ? 11
    : 14 + (dynamicCol ? 1 : 0) + (isPickingOrPicked ? -2 : 0) + (isNewOrAllTab ? -2 : 0);

  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/35",
          selected && "bg-primary/5",
          expanded && "bg-muted/25",
        )}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-expanded={expanded}
      >
        {/* Checkbox */}
        <td className="w-12 py-3 pl-3 pr-0 align-middle">
          <div className="flex min-h-11 min-w-11 items-center justify-center" data-row-ignore>
            <Checkbox
              checked={selected}
              onCheckedChange={(v) => onSelectChange(v === true)}
              aria-label={`Select order ${order.id}`}
            />
          </div>
        </td>

        {/* Order ID */}
        <td className="py-3 pr-3 align-middle">
          <span
            className="font-mono text-sm font-semibold text-primary hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onViewOrder(order);
            }}
          >
            {order.id}
          </span>
        </td>

        {/* TAT */}
        <td className="py-3 pr-3 align-middle">
          <span className={cn("text-xs font-semibold tabular-nums", tatClass)}>{displayTat}</span>
        </td>

        {/* Date & Time */}
        <td className="whitespace-nowrap py-3 pr-3 align-middle">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-foreground font-medium">
              📅 {order.date} | {order.time}
            </span>
          </div>
        </td>

        {/* Delivery Date */}
        <td className="whitespace-nowrap py-3 pr-3 align-middle">
          <DeliveryDateCell order={order} />
        </td>

        {/* Customer */}
        <td className="max-w-[220px] py-3 pr-3 align-middle">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {order.customer.name}
            </div>
            {!isPacking && (
              <div className="truncate text-xs text-muted-foreground">{order.customer.email}</div>
            )}
            <div className="truncate text-xs text-muted-foreground tabular-nums">
              {order.customer.phone}
            </div>
          </div>
        </td>

        {/* Channel */}
        {!isPickingOrPicked && !isPacking && activeTab !== "New" && activeTab !== "All" && (
          <td className="py-3 pr-3 align-middle">
            <span className="text-xs font-medium text-muted-foreground">{order.channel}</span>
          </td>
        )}

        {/* Items */}
        <td className="py-3 pr-3 align-middle">
          <span className="text-xs font-medium">{getOrderItemsCount(order)} items</span>
        </td>

        {/* Returns */}
        {!isPickingOrPicked && !isPacking && activeTab !== "Ready to Assign" && activeTab !== "New" && activeTab !== "All" && (
          <td className="py-3 pr-3 align-middle">
            {(order.returns || (order.returnItems && order.returnItems.length > 0)) ? (
              <ReturnBadge order={order} />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </td>
        )}

        {/* Picking Status & Assigned Picker */}
        {(activeTab === "Picking" || activeTab === "Picked") && (
          <>
            <td className="py-3 pr-3 align-middle">
              {(() => {
                const pickingStat = order.pickingStatus || "0/0 Picked";
                const parts = pickingStat.split(" ")[0].split("/");
                const picked = parts[0];
                const total = parts[1];
                const isFullyPicked = picked && total && picked === total && total !== "0";
                const totalNum = parseInt(total, 10) || 0;
                const pickedNum = parseInt(picked, 10) || 0;
                const pct = totalNum > 0 ? Math.round((pickedNum / totalNum) * 100) : 0;
                return (
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold w-fit",
                      isFullyPicked
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    )}>
                      {pickingStat} ({pct}%)
                    </span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={cn("h-full rounded-full transition-all duration-300", isFullyPicked ? "bg-emerald-500" : "bg-amber-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </td>
            <td className="py-3 pr-3 align-middle">
              {(() => {
                const pickers = getOrderPickers(order);
                if (pickers.length === 0) {
                  return <span className="text-xs text-muted-foreground">—</span>;
                }
                return (
                  <div className="flex flex-wrap gap-1">
                    {pickers.map((pName, idx) => (
                      <CrewTag
                        key={idx}
                        name={pName}
                        Icon={User}
                        color="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      />
                    ))}
                  </div>
                );
              })()}
            </td>
          </>
        )}
            {/* Packing Status, Assigned Packer & Bags */}
        {isPacking && (
          <>
            <td className="py-3 pr-3 align-middle">
              {(() => {
                let packingStat = order.packingStatus;
                if (!packingStat) {
                  const total = getOrderItemsCount(order);
                  if (order.itemsList && order.itemsList.length > 0) {
                    const packed = order.itemsList.filter(item => item.status === "Prepared").length;
                    packingStat = `${packed}/${total} Packing`;
                  } else {
                    const fullyPackedStatuses = ["Ready to Assign", "Driver Accepted", "Started", "Delivered"];
                    if (fullyPackedStatuses.includes(order.status)) {
                      packingStat = `${total}/${total} Packing`;
                    } else {
                      packingStat = `0/${total} Packing`;
                    }
                  }
                } else {
                  packingStat = packingStat.replace("Packed", "Packing");
                }

                const parts = packingStat.split(" ")[0].split("/");
                const packed = parts[0];
                const totalVal = parts[1];
                const isFullyPacked = packed && totalVal && packed === totalVal && totalVal !== "0";
                return (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isFullyPacked
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  )}>
                    {packingStat}
                  </span>
                );
              })()}
            </td>
            <td className="py-3 pr-3 align-middle">
              {order.packer ? (
                <CrewTag
                  name={getUserDisplayName(order.packer)}
                  Icon={Package}
                  color="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                />
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </td>
            <td className="py-3 pr-3 align-middle">
              {order.bags && order.bags > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {order.bags} {order.bags === 1 ? "Bag" : "Bags"}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </td>
          </>
        )}



        {/* City */}
        {!isPacking && !isPickingOrPicked && (
          <td className="py-3 pr-3 align-middle">
            <span className="text-xs font-medium">{order.city}</span>
          </td>
        )}

        {/* Comment */}
        <td className="py-3 pr-3 align-middle">
          <CommentCell order={order} />
        </td>

        {/* Dynamic Column: Driver / Picker / Packer / All Status */}
        {dynamicCol === "driver" && (
          <td className="py-3 pr-3 align-middle">
            <DriverCell order={order} />
          </td>
        )}
        {dynamicCol === "picker" && (
          <td className="py-3 pr-3 align-middle">
            <PickerCell order={order} />
          </td>
        )}
        {dynamicCol === "packer" && (
          <td className="py-3 pr-3 align-middle">
            <PackerCell order={order} />
          </td>
        )}
        {dynamicCol === "all_status" && (
          <td className="py-3 pr-3 align-middle">
            <AllStatusCell order={order} />
          </td>
        )}
        {activeTab === "Ready to Assign" && (
          <td className="py-3 pr-3 align-middle">
            {order.bags && order.bags > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {order.bags} {order.bags === 1 ? "Bag" : "Bags"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </td>
        )}

        {/* Total */}
        {!isPacking && (
          <td className="whitespace-nowrap py-3 pr-3 align-middle">
            <span className="text-sm font-semibold tabular-nums">QAR {order.total.toFixed(2)}</span>
          </td>
        )}

        {/* Actions */}
        <td className="py-3 pr-3 align-middle">
          <div className="inline-flex items-center gap-1" data-row-ignore>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1 rounded-md px-3 text-xs font-semibold shadow-sm"
              aria-label={`View order ${order.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onViewOrder(order);
              }}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        </td>

        {/* Shopify Status */}
        {!isPacking && (
          <td className="py-3 pr-3 align-middle">
            <ShopifyBadge status={order.status === "Delivered" ? "Fulfilled" : "Unfulfilled"} />
          </td>
        )}
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-border/70 bg-muted/20">
          <td colSpan={colSpanCount} className="px-4 py-4">
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Crew
                </div>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center gap-2 font-medium">
                    <Truck className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Driver: {getUserDisplayName(order.driver) || "—"}
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Picker: {(() => {
                      const pickers = getOrderPickers(order);
                      return pickers.length > 0 ? pickers.join(", ") : "—";
                    })()}
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Packer: {getUserDisplayName(order.packer) || "—"}
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Channel & Shopify
                </div>
                <div className="mt-2 space-y-1">
                  <ShopifyBadge status={order.status === "Delivered" ? "Fulfilled" : "Unfulfilled"} />
                  <div className="text-xs text-muted-foreground">Channel: {order.channel}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Route
                </div>
                <div className="mt-2 font-medium">{order.city}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Turnaround: <span className="font-medium text-foreground">{displayTat}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
