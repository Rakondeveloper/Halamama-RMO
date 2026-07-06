import { cn } from "@/lib/utils";

export interface DriverStatusBadgeProps {
  status: string | null | undefined;
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  if (!status) return null;

  let displayStatus = status;
  const s = status.toLowerCase();
  
  if (s === "accepted") displayStatus = "Accepted";
  else if (s === "assigned") displayStatus = "Assigned";
  else if (s === "delivery_failed" || s === "delivery failed" || s === "failed") displayStatus = "Delivery Failed";
  else if (s === "delivered" || s === "completed") displayStatus = "Delivered";
  else if (s === "started") displayStatus = "Started";

  // Colors according to requirements:
  // Accepted: Green bg, Green text
  // Started: Purple bg, Purple text
  // Delivered: Green bg, Green text
  // Delivery Failed: Red bg, Red text
  // Assigned: Blue bg, Blue text

  const colorClass = cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border border-transparent",
    (displayStatus === "Accepted" || displayStatus === "Delivered") && "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    displayStatus === "Started" && "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    displayStatus === "Delivery Failed" && "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    displayStatus === "Assigned" && "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    !["Accepted", "Started", "Delivered", "Delivery Failed", "Assigned"].includes(displayStatus) &&
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
  );

  return <span className={colorClass}>{displayStatus}</span>;
}
