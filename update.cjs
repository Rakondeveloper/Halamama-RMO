const fs = require('fs');
const file = 'src/components/orders/OrderList.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('import { Skeleton } from "@/components/ui/skeleton";', 
`import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";`);

code = code.replace(/const filtered = useMemo\([\s\S]*?\[activeTab, search\],\r?\n  \);/,
`const filtered = useMemo(() => {
    let result = orders.filter(
      (o) => matchesLegacyTab(o, activeTab) && matchesSearch(o, search)
    );

    if (filters.status !== "All") {
      result = result.filter((o) => o.status === filters.status);
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
  }, [activeTab, search, filters, days, orders]);`);

code = code.replace(/countForLegacyTab\(MOCK_ORDERS/g, 'countForLegacyTab(orders');
code = code.replace(/\{MOCK_ORDERS\.length\}/g, '{orders.length}');

code = code.replace(/const goToOrder = \(order: Order\) => \{[\s\S]*?\};/,
`const goToOrder = (order: Order) => {
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
      const randomOrder = { ...MOCK_ORDERS[Math.floor(Math.random() * MOCK_ORDERS.length)], id: \`#R\${Math.floor(Math.random() * 10000)}\` };
      setOrders([randomOrder, ...orders]);
      setLoading(false);
      toast.success("Fetched 1 new order");
    }, 1200);
  };`);

code = code.replace(/<OrdersToolbar[\s\S]*?\/>/,
`<OrdersToolbar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        days={days}
        onDaysChange={setDays}
        onRefresh={handleRefresh}
        onPullRecent={handlePullRecent}
        onFiltersOpen={() => setFiltersOpen(true)}
      />`);

code = code.replace(/<\/div>\r?\n  \);\r?\n\}/,
`
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
}`);

fs.writeFileSync(file, code);
console.log('done');
