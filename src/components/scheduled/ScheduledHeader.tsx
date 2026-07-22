import { type LucideIcon, Calendar, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledHeaderProps {
  activeTab: "Pending" | "Assigned";
  tabItemCount: number;
  uniqueOrders: number;
}

export function ScheduledHeader({ activeTab, tabItemCount, uniqueOrders }: ScheduledHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Scheduled Installations
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View and manage products scheduled for manual installation across all active orders.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        {/* KPI Card 1: Items Count */}
        <div className={cn(
          "group relative rounded-2xl p-5 overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md cursor-default",
          "hover:border-slate-300 dark:hover:border-slate-700"
        )}>
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#85afae]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#85afae]/10 dark:bg-[#9fc7c6]/10 text-[#85afae] group-hover:scale-105 transition-transform duration-300">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 tabular-nums">
                {tabItemCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
                Total {activeTab} Items
              </div>
            </div>
          </div>
        </div>

        {/* KPI Card 2: Unique Orders */}
        <div className={cn(
          "group relative rounded-2xl p-5 overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md cursor-default",
          "hover:border-slate-300 dark:hover:border-slate-700"
        )}>
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 tabular-nums">
                {uniqueOrders}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
                Unique Orders
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
