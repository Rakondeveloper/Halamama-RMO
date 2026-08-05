import { getMockOrderItems, type Order } from "@/lib/orders";
import { cn } from "@/lib/utils";

export interface DeliveryEstimate {
  label: string;
  date: string;
  time?: string;
  type: "4h" | "next-day" | "default";
}

export function calculateDeliveryDates(order: Order): DeliveryEstimate[] {
  const items = order.itemsList || getMockOrderItems(order.id, order.items || 0);

  // Group items by origin type
  const hasHilal = items.some(
    (item) => item.fc === "F01" || item.fcName?.toLowerCase().includes("hilal")
  );
  const hasMWO = items.some(
    (item) => item.fc === "MWO" || item.fcName?.toLowerCase().includes("outdoor")
  );
  const hasVS = items.some(
    (item) => item.fc === "VS" || item.fcName?.toLowerCase().includes("virtual")
  );
  const hasOther = items.some(
    (item) =>
      item.fc !== "F01" &&
      item.fc !== "MWO" &&
      item.fc !== "VS" &&
      !item.fcName?.toLowerCase().includes("hilal") &&
      !item.fcName?.toLowerCase().includes("outdoor") &&
      !item.fcName?.toLowerCase().includes("virtual")
  );

  // Parse order date & time
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  if (order.date) {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const dateParts = order.date.trim().split(/\s+/);
    if (dateParts.length >= 2) {
      const mStr = dateParts[0].substring(0, 3);
      if (months[mStr] !== undefined) {
        month = months[mStr];
      }
      const dVal = parseInt(dateParts[1], 10);
      if (!isNaN(dVal)) {
        day = dVal;
      }
    }
  }
  if (order.time) {
    const timeParts = order.time.split(":");
    if (timeParts.length >= 2) {
      const hVal = parseInt(timeParts[0], 10);
      const mVal = parseInt(timeParts[1], 10);
      if (!isNaN(hVal)) hours = hVal;
      if (!isNaN(mVal)) minutes = mVal;
    }
  }

  const orderDateTime = new Date(year, month, day, hours, minutes);
  const estimates: DeliveryEstimate[] = [];

  if (hasHilal) {
    const deliveryDateTime = new Date(orderDateTime.getTime() + 4 * 60 * 60 * 1000);
    estimates.push({
      label: "Hilal FC",
      date: deliveryDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: deliveryDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      type: "4h",
    });
  }

  if (hasMWO) {
    const nextDay = new Date(orderDateTime.getTime() + 24 * 60 * 60 * 1000);
    estimates.push({
      label: "Outdoor MWO",
      date: nextDay.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: "next-day",
    });
  }

  if (hasVS) {
    const nextDay = new Date(orderDateTime.getTime() + 24 * 60 * 60 * 1000);
    estimates.push({
      label: "Virtual Stock",
      date: nextDay.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: "default",
    });
  }

  if (hasOther || estimates.length === 0) {
    const nextDay = new Date(orderDateTime.getTime() + 24 * 60 * 60 * 1000);
    estimates.push({
      label: "Standard",
      date: nextDay.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: "default",
    });
  }

  // Deduplicate dates for next-day/default type if they are on the same day (to keep UI cleaner)
  const deduped: DeliveryEstimate[] = [];
  const seenNextDayDates = new Set<string>();

  for (const est of estimates) {
    if (est.type === "4h") {
      deduped.push(est);
    } else {
      if (!seenNextDayDates.has(est.date)) {
        seenNextDayDates.add(est.date);
        // Combine labels if multiple next-day sources exist (e.g. MWO + VS)
        const allNextDaySources = estimates.filter(
          (e) => e.type !== "4h" && e.date === est.date
        );
        const combinedLabel = allNextDaySources
          .map((e) => e.label.replace(" Delivery", ""))
          .join(" & ");
        deduped.push({
          ...est,
          label: combinedLabel,
        });
      }
    }
  }

  return deduped;
}

export function DeliveryDateCell({ order, compact = false }: { order: Order; compact?: boolean }) {
  const estimates = calculateDeliveryDates(order);

  if (compact) {
    return (
      <div className="flex flex-col gap-0.5">
        {estimates.map((est, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 font-medium text-foreground text-[11px] leading-tight"
          >
            <span>
              {est.date} {est.time ? `| ${est.time}` : ""}
            </span>
            <span
              className={cn(
                "rounded px-1 text-[8px] font-semibold uppercase tracking-wide scale-90 origin-left",
                est.type === "4h"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              )}
            >
              {est.type === "4h" ? "4h" : "Next Day"}
            </span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 py-0.5">
      {estimates.map((est, i) => (
        <div
          key={i}
          className="flex flex-col items-start gap-0.5 border-b border-border/10 last:border-b-0 pb-1 last:pb-0 w-full"
        >
          <div className="flex items-center gap-1 text-[11px] text-foreground font-semibold tabular-nums leading-tight">
            <span>📅 {est.date}</span>
            {est.time && <span className="text-muted-foreground/60 font-normal">| {est.time}</span>}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none border scale-95 origin-left",
              est.type === "4h"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
            )}
          >
            {est.type === "4h" ? `Within 4h (${est.label})` : `Next Day (${est.label})`}
          </span>
        </div>
      ))}
    </div>
  );
}
