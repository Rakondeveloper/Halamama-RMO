import { CreditCard, Wallet } from "lucide-react";
import type { EnrichedOrder } from "@/lib/orders";
import { cn } from "@/lib/utils";

export function PaymentSummary({ order }: { order: EnrichedOrder }) {
  const payment = order.payment || {};
  const balance = payment.balance ?? 0;
  const paymentStatus = balance > 0 ? "Pending" : "Paid";

  const totalPaid = payment.totalPaid ?? (payment.total !== undefined ? payment.total - balance : 0);
  const cash = payment.cash ?? (payment.method === "Cash" ? totalPaid : 0);
  const card = payment.card ?? (payment.method === "Card" ? totalPaid : 0);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Financial Summary</h2>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
              paymentStatus === "Paid" &&
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
              paymentStatus === "Pending" &&
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
            )}
          >
            {paymentStatus}
          </span>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            <MoneyRow
              label="Subtotal"
              hint={`${order.items || 1} item${(order.items || 1) === 1 ? "" : "s"}`}
              value={payment.subtotal ?? 0}
            />
            <MoneyRow label="Discount" value={-(payment.discount ?? 0)} danger />
            <MoneyRow
              label="Shipping"
              hint={payment.shippingMethod || "Standard Delivery"}
              value={payment.shipping ?? 0}
            />
          </div>

          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <MoneyRow label="Total" value={payment.total ?? order.total ?? 0} strong />
            <MoneyRow label="Balance" value={balance} strong />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Payment</h2>
        </div>
        <div className="space-y-3 p-5">
          <InfoRow label="Method" value={payment.method || "Cash"} />
          <InfoRow
            label="Total paid"
            value={`QAR ${totalPaid.toFixed(2)}`}
            positive
          />
          <InfoRow label="Cash" value={`QAR ${cash.toFixed(2)}`} />
          <InfoRow label="Card" value={`QAR ${card.toFixed(2)}`} />
        </div>
      </div>
    </section>
  );
}

function MoneyRow({
  label,
  hint,
  value,
  strong,
  danger,
}: {
  label: string;
  hint?: string;
  value: number;
  strong?: boolean;
  danger?: boolean;
}) {
  const safeVal = typeof value === "number" && !isNaN(value) ? value : 0;
  const prefix = safeVal < 0 ? "- " : "";

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 text-sm sm:grid-cols-[1fr_160px_auto]">
      <span className={cn("font-medium text-muted-foreground", strong && "text-foreground")}>
        {label}
      </span>
      <span className="hidden text-muted-foreground sm:block">{hint}</span>
      <span
        className={cn(
          "text-right font-semibold tabular-nums text-foreground",
          strong && "text-base font-bold",
          danger && "text-destructive",
        )}
      >
        {prefix}QAR {Math.abs(safeVal).toFixed(2)}
      </span>
      {hint ? (
        <span className="col-span-2 text-xs text-muted-foreground sm:hidden">{hint}</span>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold text-foreground",
          positive && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}
