import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw, Search, LayoutGrid, List, Download } from "lucide-react";

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

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      {/* Label */}
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Search Orders
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search bar */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order #, customer name or email..."
            className="h-11 pl-10 text-sm"
            aria-label="Search orders"
          />
        </div>

        {/* Right-side controls */}
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
          {/* Filters */}
          <Button variant="outline" size="sm" type="button" className="h-10 gap-2 px-4 rounded-xl justify-center" onClick={onFiltersOpen}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {/* Refresh */}
          <Button variant="outline" size="sm" type="button" className="h-10 gap-2 px-4 rounded-xl justify-center" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          {/* Days input */}
          <div className="flex items-center justify-between gap-1.5 border border-input rounded-xl px-3 h-10 bg-background sm:border-transparent sm:bg-transparent sm:px-0">
            <span className="text-xs font-medium text-muted-foreground">Days</span>
            <Input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => onDaysChange(e.target.value)}
              className="h-8 w-12 text-center text-sm font-semibold tabular-nums border-none shadow-none focus-visible:ring-0"
              aria-label="Number of days"
            />
          </div>

          {/* Pull Recent */}
          <Button
            type="button"
            size="sm"
            onClick={onPullRecent}
            className="h-10 gap-2 bg-emerald-600 px-4 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl justify-center"
          >
            <Download className="h-4 w-4" />
            Pull Recent
          </Button>
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
    <div className="flex items-center overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        onClick={() => onViewModeChange("grid")}
        className={`flex h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
          viewMode === "grid"
            ? "bg-muted text-foreground"
            : "bg-card text-muted-foreground hover:bg-muted/50"
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("list")}
        className={`flex h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
          viewMode === "list"
            ? "bg-primary text-primary-foreground"
            : "bg-card text-muted-foreground hover:bg-muted/50"
        }`}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
        List
      </button>
    </div>
  );
}
