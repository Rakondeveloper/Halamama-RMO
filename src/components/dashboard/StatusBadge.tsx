import { cn } from "@/lib/utils";

export type OrderStatus = "new" | "picked" | "packed" | "ready" | "out" | "delivered" | "failed";

const config: Record<OrderStatus, { label: string; varName: string }> = {
  new: { label: "New", varName: "--status-new" },
  picked: { label: "Picked", varName: "--status-picked" },
  packed: { label: "Packed", varName: "--status-packed" },
  ready: { label: "Ready to Assign", varName: "--status-ready" },
  out: { label: "Out for Delivery", varName: "--status-out" },
  delivered: { label: "Delivered", varName: "--status-delivered" },
  failed: { label: "Failed", varName: "--status-failed" },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-[11px] font-semibold whitespace-nowrap",
        className,
      )}
      style={{
        color: `var(${c.varName})`,
        backgroundColor: `color-mix(in oklab, var(${c.varName}) 12%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(${c.varName})` }} />
      {c.label}
    </span>
  );
}
