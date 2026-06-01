import { Button } from "@/components/ui/button";
import { MapPin, Truck, Printer, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BulkActionBar({
  count,
  onClear,
  onAssignZone,
  onAssignDriver,
  onPrintInvoices,
  onViewExport,
}: {
  count: number;
  onClear: () => void;
  onAssignZone?: () => void;
  onAssignDriver?: () => void;
  onPrintInvoices?: () => void;
  onViewExport?: () => void;
}) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-elevated",
      )}
      role="region"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {count} order{count > 1 ? "s" : ""} selected
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {/* Assign Zone — Blue */}
        <Button
          size="sm"
          type="button"
          onClick={onAssignZone}
          className="h-9 gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <MapPin className="h-3.5 w-3.5" />
          Assign Zone
        </Button>

        {/* Assign Driver — Green */}
        {onAssignDriver && (
          <Button
            size="sm"
            type="button"
            onClick={onAssignDriver}
            className="h-9 gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Truck className="h-3.5 w-3.5" />
            Assign Driver
          </Button>
        )}

        {/* Print Invoices — Purple */}
        <Button
          size="sm"
          type="button"
          onClick={onPrintInvoices}
          className="h-9 gap-2 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Invoices
        </Button>

        {/* View & Export — Orange */}
        <Button
          size="sm"
          type="button"
          onClick={onViewExport}
          className="h-9 gap-2 rounded-lg bg-orange-500 px-4 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500"
        >
          <Download className="h-3.5 w-3.5" />
          View & Export
        </Button>

        {/* Clear */}
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={onClear}
          className="h-9 gap-1 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Clear selection"
        >
          Clear
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
