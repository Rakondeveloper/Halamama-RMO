import { useState } from "react";
import { Truck, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledToolbarProps {
  activeTab: "Pending" | "Assigned";
  setActiveTab: (tab: "Pending" | "Assigned") => void;
  selectedDriver: string | null;
  setSelectedDriver: (driver: string | null) => void;
  driversList: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedIds: (ids: Set<string>) => void;
}

export function ScheduledToolbar({
  activeTab,
  setActiveTab,
  selectedDriver,
  setSelectedDriver,
  driversList,
  searchQuery,
  setSearchQuery,
  setSelectedIds,
}: ScheduledToolbarProps) {
  const [driverFilterOpen, setDriverFilterOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Tab Bar + Actions Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-fit">
          {(["Pending", "Assigned"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setSelectedIds(new Set());
                setSelectedDriver(null);
              }}
              className={cn(
                "rounded-lg px-6 py-2 text-sm font-semibold transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Driver Filter Dropdown (Visible only in Assigned Tab) */}
          {activeTab === "Assigned" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDriverFilterOpen(!driverFilterOpen)}
                className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Truck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                {selectedDriver ?? "All Drivers"}
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </button>

              {driverFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDriverFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-64 overflow-y-auto py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDriver(null);
                          setDriverFilterOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors cursor-pointer",
                          selectedDriver === null
                            ? "bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                        )}
                      >
                        {selectedDriver === null && <Check className="h-3.5 w-3.5 text-primary" />}
                        All Drivers
                      </button>
                      {driversList.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setSelectedDriver(d);
                            setDriverFilterOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors cursor-pointer",
                            selectedDriver === d
                              ? "bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 font-bold"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                          )}
                        >
                          {selectedDriver === d && <Check className="h-3.5 w-3.5 text-primary" />}
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search by product, SKU, order number, or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
      </div>
    </div>
  );
}
