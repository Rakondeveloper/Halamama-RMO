import { cn } from "@/lib/utils";
import { statusDotClass, statusIcon, type OrderStatus } from "@/lib/orders";

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const Icon = statusIcon[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold text-foreground",
        className,
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={cn("h-2 w-2 rounded-full", statusDotClass(status))}
          aria-hidden
        />
      </span>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span>{status}</span>
    </span>
  );
}
