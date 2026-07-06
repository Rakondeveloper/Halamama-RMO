import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw, Search, LayoutGrid, List, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

export function OrdersToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  days,
  onDaysChange,
  onRefresh,
  onPullRecent,
  onFiltersOpen,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (v: ViewMode) => void;
  days: string;
  onDaysChange: (v: string) => void;
  onRefresh: () => void;
  onPullRecent: () => void;
  onFiltersOpen: () => void;
}) {
  const mode = viewMode ?? "list";
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft transition-all duration-300">
      {/* Label */}
      <div className="mb-2 sm:mb-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
        Search & Filter Orders
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-4 lg:flex-row lg:items-center">
        {/* Search bar */}
        <div
          className={cn(
            "relative min-w-0 flex-1 rounded-xl transition-all duration-300 border",
            isSearchFocused
              ? "border-primary/50 bg-background shadow-soft ring-2 ring-primary/10"
              : "border-border/80 bg-muted/20 hover:border-border-hover"
          )}
        >
          <Search className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 sm:h-4.5 sm:w-4.5 -translate-y-1/2 text-muted-foreground transition-colors duration-300" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search by order #, customer name or email..."
            className="h-10 sm:h-11 w-full pl-10 sm:pl-11 pr-4 bg-transparent border-0 text-[13px] sm:text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/75"
            aria-label="Search orders"
          />
        </div>

        {/* Right-side controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Filters */}
          <button
            type="button"
            className="flex items-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-border bg-card text-[13px] sm:text-sm font-semibold text-foreground/80 hover:text-foreground hover:border-primary/30 hover:bg-muted/30 shadow-soft transition-all hover:-translate-y-[1px] active:scale-[0.97] duration-200"
            onClick={onFiltersOpen}
          >
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <span>Filters</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            className="group flex items-center gap-1.5 sm:gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-border bg-card text-[13px] sm:text-sm font-semibold text-foreground/80 hover:text-foreground hover:border-primary/30 hover:bg-muted/30 shadow-soft transition-all hover:-translate-y-[1px] active:scale-[0.97] duration-200"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground transition-transform duration-500 group-hover:rotate-180" />
            <span>Refresh</span>
          </button>

          {/* Days input pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 border border-border bg-muted/30 rounded-xl px-2.5 sm:px-3 h-10 sm:h-11 transition-all hover:border-primary/30">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Days</span>
            <input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => onDaysChange(e.target.value)}
              className="h-7 sm:h-8 w-8 sm:w-10 text-center text-[13px] sm:text-sm font-bold bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-none p-0 selection:bg-primary/20 tabular-nums"
              aria-label="Number of days"
            />
          </div>

          {/* Pull Recent */}
          <button
            type="button"
            onClick={onPullRecent}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 bg-gradient-success text-white text-[13px] sm:text-sm font-bold shadow-soft hover:opacity-95 transition-all hover:-translate-y-[1px] active:scale-[0.97] duration-200 rounded-xl border-0"
          >
            <Download className="h-4 w-4" />
            <span>Pull Recent</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-border bg-muted/30 p-0.5 shadow-soft">
      <button
        type="button"
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
          viewMode === "grid"
            ? "bg-card text-foreground shadow-soft border border-border"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
          viewMode === "list"
            ? "bg-card text-foreground shadow-soft border border-border"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List className="h-3.5 w-3.5" />
        List
      </button>
    </div>
  );
}
