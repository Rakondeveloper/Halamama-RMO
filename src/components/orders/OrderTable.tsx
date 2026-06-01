import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, LegacyTabId } from "@/lib/orders";
import { OrderTableRow } from "./OrderTableRow";

/** Determine which dynamic column to show based on the active tab */
function getDynamicColumn(activeTab: LegacyTabId): "driver" | "picker" | "packer" | null {
  switch (activeTab) {
    case "Unfulfilled":
    case "Driver Accepted":
    case "Started":
    case "Delivered":
    case "Delivery Failed":
    case "All":
      return "driver";
    case "Picked":
      return "picker";
    case "Ready to Assign":
      return "packer";
    default:
      return null;
  }
}

export function OrderTable({
  orders,
  selectedIds,
  onSelect,
  onSelectAllVisible,
  allVisibleSelected,
  someVisibleSelected,
  expandedId,
  onExpandedChange,
  onViewOrder,
  loading,
  activeTab,
}: {
  orders: Order[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAllVisible: (select: boolean) => void;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  expandedId: string | null;
  onExpandedChange: (id: string | null) => void;
  onViewOrder: (order: Order) => void;
  loading: boolean;
  activeTab?: LegacyTabId;
}) {
  const dynamicCol = getDynamicColumn(activeTab ?? "All");

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 max-w-xs" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const dynamicLabel = dynamicCol === "driver" ? "Driver" : dynamicCol === "picker" ? "Picker" : dynamicCol === "packer" ? "Packer" : null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="w-12 py-3 pl-3 pr-0">
              <div className="flex min-h-11 min-w-11 items-center justify-center">
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => onSelectAllVisible(v === true)}
                  aria-label="Select all visible orders"
                />
              </div>
            </th>
            <th className="py-3 pr-3 font-semibold">Order</th>
            <th className="py-3 pr-3 font-semibold">TAT</th>
            <th className="py-3 pr-3 font-semibold">
              <span className="inline-flex items-center gap-1">
                Date & Time
                <span className="text-muted-foreground/50">↕</span>
              </span>
            </th>
            <th className="py-3 pr-3 font-semibold">Customer</th>
            <th className="py-3 pr-3 font-semibold">Channel</th>
            <th className="py-3 pr-3 font-semibold">Items</th>
            <th className="py-3 pr-3 font-semibold">Returns & Replacements</th>
            <th className="py-3 pr-3 font-semibold">City</th>
            <th className="py-3 pr-3 font-semibold">Coordinator</th>
            {dynamicLabel && (
              <th className="py-3 pr-3 font-semibold">{dynamicLabel}</th>
            )}
            <th className="py-3 pr-3 font-semibold">Total</th>
            <th className="py-3 pr-3 font-semibold">Actions</th>
            <th className="py-3 pr-3 font-semibold">Shopify Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderTableRow
              key={order.id}
              order={order}
              selected={selectedIds.has(order.id)}
              onSelectChange={(sel) => onSelect(order.id, sel)}
              expanded={expandedId === order.id}
              onToggleExpand={() =>
                onExpandedChange(expandedId === order.id ? null : order.id)
              }
              onViewOrder={onViewOrder}
              dynamicCol={dynamicCol}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
