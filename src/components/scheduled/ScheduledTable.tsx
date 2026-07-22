import { Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { type ScheduledItem } from "@/lib/scheduled-installations";
import { ScheduledRow } from "./ScheduledRow";
import { useNavigate } from "@tanstack/react-router";

interface ScheduledTableProps {
  filtered: ScheduledItem[];
  activeTab: "Pending" | "Assigned";
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  setPendingCancelItem: (item: ScheduledItem) => void;
  formatTime: (iso: string) => string;
}

export function ScheduledTable({
  filtered,
  activeTab,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  allVisibleSelected,
  someVisibleSelected,
  setPendingCancelItem,
  formatTime,
}: ScheduledTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-[48px_2.5fr_1fr_1.5fr_1.2fr_1.2fr_2fr] items-center gap-4 border-b border-slate-100 dark:border-slate-800 bg-[#f8f9fa] dark:bg-slate-800/30 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
            onCheckedChange={toggleSelectAll}
            className="h-5 w-5 rounded-[6px] border border-slate-300 dark:border-slate-600 focus-visible:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
        <div>Product</div>
        <div>Order</div>
        <div>Customer</div>
        <div>Status</div>
        <div>Scheduled At</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Table Body */}
      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <p className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">No installations found</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            {activeTab === "Pending"
              ? "Schedule installations from the order details page."
              : "No assigned installations yet."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((item) => (
            <ScheduledRow
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onToggle={() => toggleSelect(item.id)}
              onRemove={() => setPendingCancelItem(item)}
              onViewOrder={() =>
                navigate({
                  to: "/orders/$orderId",
                  params: { orderId: item.orderId },
                })
              }
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
