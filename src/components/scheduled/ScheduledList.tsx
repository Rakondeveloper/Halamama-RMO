import { useState, useMemo, useSyncExternalStore } from "react";
import { useSyncExternalStore as useSync } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getSnapshot,
  subscribe,
  removeItem,
  assignDriver,
  AVAILABLE_DRIVERS,
  type ScheduledItem,
} from "@/lib/scheduled-installations";
import { getUsers } from "@/lib/sync";
import { ScheduledHeader } from "./ScheduledHeader";
import { ScheduledToolbar } from "./ScheduledToolbar";
import { ScheduledTable } from "./ScheduledTable";
import { AssignDriverDialog, CancelInstallationDialog } from "./ScheduledModals";

export function ScheduledList() {
  const items = useSyncExternalStore(subscribe, getSnapshot);

  const driversList = useMemo(() => {
    const list = new Set<string>();
    try {
      getUsers()
        .filter((u) => u.role === "driver" && u.status === "active")
        .forEach((u) => list.add(u.name));
    } catch (e) {}

    if (list.size > 0) return Array.from(list);
    return AVAILABLE_DRIVERS;
  }, []);

  const [activeTab, setActiveTab] = useState<"Pending" | "Assigned">("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [selectedAssignDriver, setSelectedAssignDriver] = useState<string | null>(null);
  const [pendingCancelItem, setPendingCancelItem] = useState<ScheduledItem | null>(null);

  // Filter items
  const filtered = useMemo(() => {
    let result = items.filter((i) => i.status === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace("#", "").trim();
      result = result.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.orderId.toLowerCase().replace("#", "").includes(q) ||
          i.customerName.toLowerCase().includes(q),
      );
    }

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

  const handleConfirmCancel = () => {
    if (!pendingCancelItem) return;
    const id = pendingCancelItem.id;
    removeItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.info("Installation removed");
    setPendingCancelItem(null);
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

  const formatAbsoluteTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header section */}
      <ScheduledHeader
        activeTab={activeTab}
        tabItemCount={tabItemCount}
        uniqueOrders={uniqueOrders}
      />

      {/* Toolbar filter section */}
      <ScheduledToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
        driversList={driversList}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedIds={setSelectedIds}
      />

      {/* Main Table view */}
      <ScheduledTable
        filtered={filtered}
        activeTab={activeTab}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        setPendingCancelItem={setPendingCancelItem}
        formatTime={formatAbsoluteTime}
      />

      {/* Footer stats bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <span>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span>{" "}
            {activeTab.toLowerCase()} installation(s)
          </span>
        </div>
      )}

      {/* Dialog Modals */}
      <AssignDriverDialog
        isOpen={assignDropdownOpen}
        setIsOpen={setAssignDropdownOpen}
        selectedCount={selectedIds.size}
        driversList={driversList}
        selectedDriver={selectedAssignDriver}
        setSelectedDriver={setSelectedAssignDriver}
        onAssign={handleAssignDriver}
      />

      <CancelInstallationDialog
        item={pendingCancelItem}
        onClose={() => setPendingCancelItem(null)}
        onConfirm={handleConfirmCancel}
      />

      {/* Sticky Bulk Action Bar at Bottom */}
      {selectedIds.size > 0 && activeTab === "Pending" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800/80 dark:border-slate-800/60 backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
            {selectedIds.size} installation{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Clear Selection
            </button>
            <Button
              onClick={() => setAssignDropdownOpen(true)}
              className="gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-md font-bold text-xs h-9 px-4 transition-all cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assign Driver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
