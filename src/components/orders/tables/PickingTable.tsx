import { Skeleton } from "@/components/ui/skeleton";
import { getOrderItemsCount, tatColorClass, type Order } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Eye, Package } from "lucide-react";
import { CrewTag } from "../CrewTag";
import { Button } from "@/components/ui/button";

export function PickingTable({
  orders,
  loading,
  onViewOrder,
}: {
  orders: Order[];
  loading?: boolean;
  onViewOrder: (order: Order) => void;
}) {
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

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[1000px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="py-3 pl-4 pr-3 font-semibold">Order</th>
            <th className="py-3 pr-3 font-semibold">TAT</th>
            <th className="py-3 pr-3 font-semibold">Date & Time</th>
            <th className="py-3 pr-3 font-semibold">Customer</th>
            <th className="py-3 pr-3 font-semibold">Items</th>
            <th className="py-3 pr-3 font-semibold">Picking Status</th>
            <th className="py-3 pr-3 font-semibold">Assigned Picker</th>
            <th className="py-3 pr-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const tatClass = tatColorClass(order.tat);
            return (
              <tr
                key={order.id}
                className="border-b border-border/70 transition-colors hover:bg-muted/35"
              >
                <td className="py-3 pl-4 pr-3 align-middle">
                  <span className="font-mono text-sm font-semibold text-primary hover:underline cursor-pointer">
                    {order.id}
                  </span>
                </td>
                <td className="py-3 pr-3 align-middle">
                  <span className={cn("text-xs font-semibold tabular-nums", tatClass)}>
                    {order.tat}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-3 align-middle">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">
                      📅 {order.date} | {order.time}
                    </span>
                  </div>
                </td>
                <td className="max-w-[220px] py-3 pr-3 align-middle">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {order.customer.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {order.customer.email}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 align-middle">
                  <span className="text-xs font-medium">{getOrderItemsCount(order)}</span>
                </td>
                <td className="py-3 pr-3 align-middle">
                  <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                    {order.pickingStatus || "0/0 Picked"}
                  </span>
                </td>
                <td className="py-3 pr-3 align-middle">
                  {order.picker ? (
                    <CrewTag
                      name={order.picker}
                      Icon={Package}
                      color="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 align-middle text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 gap-1 rounded-md px-3 text-xs font-semibold shadow-sm"
                    onClick={() => onViewOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
