import type { KeyboardEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Order } from "@/lib/orders";
import { tatColorClass } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Package, Truck, User, Eye } from "lucide-react";
import { CrewTag } from "./CrewTag";

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

function ReturnBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Return ({count})
    </span>
  );
}

function DriverCell({ order }: { order: Order }) {
  if (!order.driver) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <CrewTag
        name={order.driver}
        Icon={Truck}
        color="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
      />
      {order.driverStatus && (
        <span
          className={cn(
            "text-[10px] font-medium",
            order.driverStatus === "Accepted" && "text-emerald-600 dark:text-emerald-400",
            order.driverStatus === "Completed" && "text-emerald-600 dark:text-emerald-400",
            order.driverStatus === "Delivery failed" && "text-red-600 dark:text-red-400",
            !["Accepted", "Completed", "Delivery failed"].includes(order.driverStatus) &&
              "text-muted-foreground",
          )}
        >
          ● {order.driverStatus}
        </span>
      )}
    </div>
  );
}

function PickerCell({ order }: { order: Order }) {
  if (!order.picker) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <CrewTag
      name={order.picker}
      Icon={User}
      color="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
    />
  );
}

function PackerCell({ order }: { order: Order }) {
  if (!order.packer) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <CrewTag
      name={order.packer}
      Icon={Package}
      color="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
    />
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
}: {
  order: Order;
  selected: boolean;
  onSelectChange: (next: boolean) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewOrder: (order: Order) => void;
  dynamicCol: "driver" | "picker" | "packer" | null;
}) {
  const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
    const el = e.target as HTMLElement;
    if (el.closest("button, [role='checkbox'], a, input, [data-row-ignore]")) return;
    onToggleExpand();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      const t = e.target as HTMLElement;
      if (t.closest("button, [role='checkbox']")) return;
      e.preventDefault();
      onToggleExpand();
    }
  };

  const tatClass = tatColorClass(order.tat);

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
          <span className="font-mono text-sm font-semibold text-primary hover:underline cursor-pointer">
            {order.id}
          </span>
        </td>

        {/* TAT */}
        <td className="py-3 pr-3 align-middle">
          <span className={cn("text-xs font-semibold tabular-nums", tatClass)}>{order.tat}</span>
        </td>

        {/* Date & Time */}
        <td className="whitespace-nowrap py-3 pr-3 align-middle">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-foreground font-medium">
              📅 {order.date} | {order.time}
            </span>
          </div>
        </td>

        {/* Customer */}
        <td className="max-w-[220px] py-3 pr-3 align-middle">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {order.customer.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">{order.customer.email}</div>
            <div className="truncate text-xs text-muted-foreground tabular-nums">
              {order.customer.phone}
            </div>
          </div>
        </td>

        {/* Channel */}
        <td className="py-3 pr-3 align-middle">
          <span className="text-xs font-medium text-muted-foreground">{order.channel}</span>
        </td>

        {/* Items */}
        <td className="py-3 pr-3 align-middle">
          <span className="text-xs font-medium">{order.items} items</span>
        </td>

        {/* Returns & Replacements */}
        <td className="py-3 pr-3 align-middle">
          {order.returns ? (
            <ReturnBadge count={order.returns.count} />
          ) : (
            <span className="text-xs text-muted-foreground"></span>
          )}
        </td>

        {/* City */}
        <td className="py-3 pr-3 align-middle">
          <span className="text-xs font-medium">{order.city}</span>
        </td>

        {/* Coordinator */}
        <td className="py-3 pr-3 align-middle">
          <span className="text-xs text-muted-foreground">{order.coordinator}</span>
        </td>

        {/* Dynamic Column: Driver / Picker / Packer */}
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

        {/* Total */}
        <td className="whitespace-nowrap py-3 pr-3 align-middle">
          <span className="text-sm font-semibold tabular-nums">QAR {order.total.toFixed(2)}</span>
        </td>

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
        <td className="py-3 pr-3 align-middle">
          <ShopifyBadge status={order.status === "Delivered" ? "Fulfilled" : "Unfulfilled"} />
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-border/70 bg-muted/20">
          <td colSpan={dynamicCol ? 15 : 14} className="px-4 py-4">
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Crew
                </div>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center gap-2 font-medium">
                    <Truck className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Driver: {order.driver ?? "—"}
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Picker: {order.picker ?? "—"}
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Packer: {order.packer ?? "—"}
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
                  Turnaround: <span className="font-medium text-foreground">{order.tat}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
