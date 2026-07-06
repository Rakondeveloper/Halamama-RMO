import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { OrderTable } from "@/components/orders/OrderTable";
import { type Order } from "@/lib/orders";
import { useOrders } from "@/hooks/useOrders";
import { useState, useEffect } from "react";
import { BulkActionBar } from "@/components/orders/BulkActionBar";
import { AssignDriverDialog } from "@/components/orders/AssignDriverDialog";
import { AssignZoneDialog } from "@/components/orders/AssignZoneDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/ready")({
  head: () => ({
    meta: [
      { title: "Ready to Assign - Halamama LMD" },
    ],
  }),
  component: ReadyPage,
});

function ReadyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const { data: allOrders = [] } = useOrders();

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 380);
    return () => window.clearTimeout(t);
  }, []);

  const goToOrder = (order: Order) => {
    navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
  };

  const orders = allOrders.filter(o => o.status === "Ready to Assign");

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
      if (select) orders.forEach((o) => next.add(o.id));
      else orders.forEach((o) => next.delete(o.id));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-[1780px] flex-1 space-y-4 p-4 md:space-y-5 md:p-6 relative">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Ready to Assign</h1>
          </div>
          <OrderTable
            orders={orders}
            loading={loading}
            onViewOrder={goToOrder}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onSelectAllVisible={onSelectAllVisible}
            allVisibleSelected={orders.length > 0 && orders.every(o => selectedIds.has(o.id))}
            someVisibleSelected={orders.some(o => selectedIds.has(o.id)) && !(orders.length > 0 && orders.every(o => selectedIds.has(o.id)))}
            expandedId={expandedId}
            onExpandedChange={setExpandedId}
            activeTab="Ready to Assign"
          />

          <BulkActionBar
            count={selectedIds.size}
            onClear={() => setSelectedIds(new Set())}
            onAssignZone={() => setZoneDialogOpen(true)}
            onAssignDriver={() => setDriverDialogOpen(true)}
          />

          <AssignZoneDialog
            open={zoneDialogOpen}
            onOpenChange={setZoneDialogOpen}
            selectedCount={selectedIds.size}
            onAssign={(zone, zoneName, overrideExisting) => {
              toast.success(`Assigned zone "${zoneName}" to ${selectedIds.size} order(s)${overrideExisting ? " (Override)" : ""}`);
              setSelectedIds(new Set());
            }}
          />
          <AssignDriverDialog
            open={driverDialogOpen}
            onOpenChange={setDriverDialogOpen}
            selectedCount={selectedIds.size}
            onAssign={(driver) => {
              toast.success(`Assigned driver ${driver} to ${selectedIds.size} order(s)`);
              setSelectedIds(new Set());
            }}
          />
        </main>
      </div>
    </div>
  );
}
