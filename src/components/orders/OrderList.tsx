import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  countForLegacyTab,
  matchesLegacyTab,
  matchesSearch,
  MOCK_ORDERS,
  LEGACY_TABS,
  type LegacyTabId,
  type Order,
} from "@/lib/orders";
import { getEnrichedOrder } from "@/lib/orders";
import { PrintInvoiceDialog } from "./PrintInvoiceDialog";
import { ViewExportDialog } from "./ViewExportDialog";
import { BulkActionBar } from "./BulkActionBar";
import { OrderCard } from "./OrderCard";
import { OrderTable } from "./OrderTable";
import { OrdersTabs } from "./OrdersTabs";
import { OrdersToolbar, ViewToggle, type ViewMode } from "./OrdersToolbar";
import { AssignDriverDialog } from "./AssignDriverDialog";
import { toast } from "sonner";

export function OrderList({ initialTab }: { initialTab?: LegacyTabId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<LegacyTabId>(initialTab || "New");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [days, setDays] = useState("30");
  const [filters, setFilters] = useState({
    status: "All",
    paymentStatus: "All",
    customer: "",
  });

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const baseOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      result = result.filter((o) => matchesSearch(o, search));
    }
    
    if (filters.customer.trim()) {
      const cSearch = filters.customer.toLowerCase();
      result = result.filter((o) => o.customer.name.toLowerCase().includes(cSearch));
    }

    const d = parseInt(days) || 1;
    if (d < 30 && result.length > 2) {
       result = result.slice(0, Math.max(1, result.length - Math.floor((30 - d) / 2)));
    }

    return result;
  }, [orders, search, filters.customer, days]);

  const filtered = useMemo(() => {
    let result = baseOrders.filter((o) => matchesLegacyTab(o, activeTab));

    if (filters.status !== "All") {
      result = result.filter((o) => o.status === filters.status);
    }
    
    return result;
  }, [baseOrders, activeTab, filters.status]);

  const tabCounts = useMemo(() => {
    const counts = {} as Record<LegacyTabId, number>;
    for (const tab of LEGACY_TABS) {
      counts[tab.id] = countForLegacyTab(baseOrders, tab.id);
    }
    return counts;
  }, [baseOrders]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));
  const someVisibleSelected =
    filtered.some((o) => selectedIds.has(o.id)) && !allVisibleSelected;

  const onSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const onSelectAllVisible = (select: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (select) filtered.forEach((o) => next.add(o.id));
      else filtered.forEach((o) => next.delete(o.id));
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  const goToOrder = (order: Order) => {
    navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
  };

  const handleRefresh = () => {
    setLoading(true);
    toast.info("Refreshing orders...");
    setTimeout(() => {
      setOrders([...MOCK_ORDERS].sort(() => Math.random() - 0.5));
      setLoading(false);
      toast.success("Orders refreshed");
    }, 800);
  };

  const handlePullRecent = () => {
    setLoading(true);
    toast.info("Fetching recent orders...");
    setTimeout(() => {
      const randomOrder = { ...MOCK_ORDERS[Math.floor(Math.random() * MOCK_ORDERS.length)], id: `#R${Math.floor(Math.random() * 10000)}` };
      setOrders([randomOrder, ...orders]);
      setLoading(false);
      toast.success("Fetched 1 new order");
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <OrdersToolbar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        days={days}
        onDaysChange={setDays}
        onRefresh={handleRefresh}
        onPullRecent={handlePullRecent}
        onFiltersOpen={() => setFiltersOpen(true)}
      />

      {/* Tabs + View Toggle row */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-2">
          <OrdersTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabCounts={tabCounts}
          />
        </div>
        <div className="hidden shrink-0 md:block">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          {orders.length} orders
        </span>
      </div>

      {loading ? (
        <>
          <div className="rounded-lg border border-border bg-card p-4 md:hidden">
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 max-w-xs" />
                    <Skeleton className="h-3 w-full max-w-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <OrderTable
              orders={[]}
              selectedIds={selectedIds}
              onSelect={onSelect}
              onSelectAllVisible={onSelectAllVisible}
              allVisibleSelected={false}
              someVisibleSelected={false}
              expandedId={null}
              onExpandedChange={() => {}}
              onViewOrder={goToOrder}
              loading
              activeTab={activeTab}
            />
          </div>
        </>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No orders match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another status tab or clear search.</p>
        </div>
      ) : (
        <>
          <div className="md:hidden">
            <div className="space-y-3">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selectedIds.has(order.id)}
                  onSelectChange={(sel) => onSelect(order.id, sel)}
                  expanded={expandedId === order.id}
                  onToggleExpand={() =>
                    setExpandedId((id) => (id === order.id ? null : order.id))
                  }
                  onViewOrder={goToOrder}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    selected={selectedIds.has(order.id)}
                    onSelectChange={(sel) => onSelect(order.id, sel)}
                    expanded={expandedId === order.id}
                    onToggleExpand={() =>
                      setExpandedId((id) => (id === order.id ? null : order.id))
                    }
                    onViewOrder={goToOrder}
                  />
                ))}
              </div>
            ) : (
              <OrderTable
                orders={filtered}
                selectedIds={selectedIds}
                onSelect={onSelect}
                onSelectAllVisible={onSelectAllVisible}
                allVisibleSelected={allVisibleSelected}
                someVisibleSelected={someVisibleSelected}
                expandedId={expandedId}
                onExpandedChange={setExpandedId}
                onViewOrder={goToOrder}
                loading={false}
                activeTab={activeTab}
              />
            )}
          </div>
        </>
      )}

      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span>Page 1 of 1</span>
          <div className="flex flex-wrap gap-1">
            {["Prev", "1", "Next"].map((item) => (
              <button
                key={item}
                type="button"
                className="min-h-9 min-w-9 rounded-md px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <BulkActionBar
        count={selectedCount}
        onClear={() => setSelectedIds(new Set())}
        onAssignZone={() => {}}
        onAssignDriver={activeTab === "Ready to Assign" ? () => setDriverDialogOpen(true) : undefined}
        onPrintInvoices={() => setPrintDialogOpen(true)}
        onViewExport={() => setExportDialogOpen(true)}
      />

      <AssignDriverDialog
        open={driverDialogOpen}
        onOpenChange={setDriverDialogOpen}
        selectedCount={selectedCount}
        onAssign={(driver, force) => {
          toast.success(`Assigned driver ${driver} to ${selectedCount} order(s)${force ? " (Forced)" : ""}`);
          setSelectedIds(new Set());
        }}
      />
      <PrintInvoiceDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        orders={Array.from(selectedIds).map(id => getEnrichedOrder(id)).filter(Boolean) as any}
      />
      <ViewExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        orders={Array.from(selectedIds).map(id => getEnrichedOrder(id)).filter(Boolean) as any}
        activeTab={activeTab}
      />
    
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-md p-0 flex flex-col bg-card border-border">
          <div className="p-6 border-b border-border">
            <SheetHeader>
              <SheetTitle>Filter Orders</SheetTitle>
              <SheetDescription>
                Narrow down your order list based on specific criteria.
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                <SelectTrigger id="status" className="w-full bg-background border-border">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  <SelectItem value="All">All Statuses</SelectItem>
                  {LEGACY_TABS.filter(t => t.id !== "All").map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={filters.paymentStatus} onValueChange={(v) => setFilters(f => ({ ...f, paymentStatus: v }))}>
                <SelectTrigger id="paymentStatus" className="w-full bg-background border-border">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input 
                id="customer"
                value={filters.customer}
                onChange={(e) => setFilters(f => ({ ...f, customer: e.target.value }))}
                placeholder="E.g. John Doe"
                className="bg-background border-border"
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setFilters({ status: "All", paymentStatus: "All", customer: "" })}
              >
                Clear All
              </Button>
              <Button 
                className="flex-1 bg-gradient-primary text-white shadow-glow"
                onClick={() => setFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
