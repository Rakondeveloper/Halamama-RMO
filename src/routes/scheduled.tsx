import { useState, useMemo, useSyncExternalStore } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  getSnapshot,
  subscribe,
  removeItem,
  assignDriver,
  AVAILABLE_DRIVERS,
  type ScheduledItem,
} from "@/lib/scheduled-installations";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Package,
  Search,
  ShoppingCart,
  Truck,
  UserPlus,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/scheduled")({
  head: () => ({
    meta: [
      { title: "Scheduled Installations - Halamama LMD" },
      {
        name: "description",
        content:
          "View and manage products scheduled for manual installation across all active orders.",
      },
    ],
  }),
  component: ScheduledInstallationsPage,
});

function ScheduledInstallationsPage() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-5 p-4 md:p-6 lg:p-8">
          <ScheduledInstallationsContent />
        </main>
      </div>
    </div>
  );
}

function ScheduledInstallationsContent() {
  const navigate = useNavigate();
  const items = useSyncExternalStore(subscribe, getSnapshot);

  const [activeTab, setActiveTab] = useState<"Pending" | "Assigned">("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [driverFilterOpen, setDriverFilterOpen] = useState(false);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedAssignDriver, setSelectedAssignDriver] = useState<string | null>(null);

  // Filter items
  const filtered = useMemo(() => {
    let result = items.filter((i) => i.status === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.orderId.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q),
      );
    }

    // If filtering by a driver, only show that driver's items
    if (selectedDriver && activeTab === "Assigned") {
      result = result.filter((i) => i.assignedDriver === selectedDriver);
    }

    return result;
  }, [items, activeTab, searchQuery, selectedDriver]);

  // Stats
  const currentItems = items.filter((i) => i.status === activeTab);
  const tabItemCount = currentItems.length;
  const uniqueOrders = new Set(currentItems.map((i) => i.orderId)).size;

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));
  const someVisibleSelected =
    filtered.some((i) => selectedIds.has(i.id)) && !allVisibleSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.add(i.id));
        return next;
      });
    }
  };

  const handleRemove = (id: string) => {
    removeItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.info("Installation removed");
  };

  const handleAssignDriver = () => {
    if (!selectedAssignDriver) return;
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    assignDriver(ids, selectedAssignDriver);
    toast.success(`Assigned ${selectedAssignDriver} to ${ids.length} item(s)`);
    setSelectedIds(new Set());
    setAssignDropdownOpen(false);
    setSelectedAssignDriver(null);
  };

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours === 1) return "about 1 hour ago";
    if (hours < 24) return `about ${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day(s) ago`;
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Scheduled Installations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage products scheduled for manual installation across all active orders.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {tabItemCount}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total {activeTab} Items
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/10">
            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {uniqueOrders}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unique Orders
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar + Actions Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-card p-1">
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
                "rounded-md px-4 py-2 text-sm font-semibold transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Driver Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDriverFilterOpen(!driverFilterOpen)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted cursor-pointer"
            >
              <Truck className="h-4 w-4 text-muted-foreground" />
              {selectedDriver ?? "All Drivers"}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {driverFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDriverFilterOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-2">
                  <div className="max-h-64 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDriver(null);
                        setDriverFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer",
                        selectedDriver === null
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {selectedDriver === null && <Check className="h-3.5 w-3.5" />}
                      All Drivers
                    </button>
                    {AVAILABLE_DRIVERS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDriver(d);
                          setDriverFilterOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors cursor-pointer",
                          selectedDriver === d
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        {selectedDriver === d && <Check className="h-3.5 w-3.5" />}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Assign Driver Button (visible when items selected) */}
          {selectedIds.size > 0 && activeTab === "Pending" && (
            <div className="relative">
              <Button
                onClick={() => setAssignDropdownOpen(true)}
                className="gap-2 rounded-xl bg-primary text-primary-foreground shadow-md font-semibold h-10 px-5 transition-all hover:shadow-lg cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Assign Driver ({selectedIds.size})
              </Button>

              <Dialog open={assignDropdownOpen} onOpenChange={setAssignDropdownOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Assign Driver</DialogTitle>
                    <DialogDescription>
                      Select a driver to assign to the {selectedIds.size} selected installation(s).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label className="font-semibold text-sm">Select Driver</Label>
                      <Select value={selectedAssignDriver || ""} onValueChange={setSelectedAssignDriver}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a driver..." />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_DRIVERS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAssignDropdownOpen(false)} className="cursor-pointer">
                      Cancel
                    </Button>
                    <Button onClick={handleAssignDriver} disabled={!selectedAssignDriver} className="cursor-pointer">
                      Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by product, SKU, order number, or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-card transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[48px_1fr_100px_140px_100px_140px_130px] items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={allVisibleSelected}
              // @ts-ignore
              indeterminate={someVisibleSelected}
              onCheckedChange={toggleSelectAll}
              className="h-4 w-4"
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
            <Package className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-foreground">No installations found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "Pending"
                ? "Schedule installations from the order details page."
                : "No assigned installations yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <ScheduledRow
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={() => toggleSelect(item.id)}
                onRemove={() => handleRemove(item.id)}
                onViewOrder={() =>
                  navigate({
                    to: "/orders/$orderId",
                    params: { orderId: item.orderId },
                  })
                }
                formatTime={formatRelativeTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span>
            Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            {activeTab.toLowerCase()} installation(s)
          </span>
        </div>
      )}
    </div>
  );
}

function ScheduledRow({
  item,
  selected,
  onToggle,
  onRemove,
  onViewOrder,
  formatTime,
}: {
  item: ScheduledItem;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onViewOrder: () => void;
  formatTime: (iso: string) => string;
}) {
  return (
    <>
      {/* Desktop Row */}
      <div
        className={cn(
          "hidden md:grid md:grid-cols-[48px_1fr_100px_140px_100px_140px_130px] items-center gap-2 px-4 py-3 transition-colors",
          selected ? "bg-primary/5" : "hover:bg-muted/30",
        )}
      >
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            className="h-4 w-4"
          />
        </div>

        {/* Product */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
            <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
          </div>
        </div>

        {/* Order */}
        <div>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
            #{item.orderId}
          </span>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-1.5 text-sm text-foreground truncate">
          <span className="truncate">{item.customerName}</span>
        </div>

        {/* Status */}
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              item.status === "Pending"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            )}
          >
            {item.status}
          </span>
        </div>

        {/* Scheduled At */}
        <div className="text-xs text-muted-foreground">{formatTime(item.scheduledAt)}</div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onViewOrder}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Order
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="grid h-7 w-7 place-items-center rounded-lg text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove scheduled installation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Card */}
      <div
        className={cn(
          "md:hidden p-4 transition-colors",
          selected ? "bg-primary/5" : "",
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            className="mt-1 h-4 w-4"
          />
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
            <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold text-foreground leading-snug">{item.productName}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                #{item.orderId}
              </span>
              <span>{item.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  item.status === "Pending"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                )}
              >
                {item.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(item.scheduledAt)}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onViewOrder}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <ExternalLink className="h-3 w-3" />
                View Order
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="text-xs font-semibold text-destructive"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
