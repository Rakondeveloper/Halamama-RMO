import {
  ChevronDown,
  Printer,
  UserPlus,
  RotateCcw,
  PackageCheck,
  Package,
  Truck,
  CreditCard,
  Warehouse,
  XCircle,
  ArrowLeftRight,
  Undo2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { PrintInvoiceDialog } from "../PrintInvoiceDialog";
import { useState } from "react";
import type { EnrichedOrder } from "@/lib/orders";

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  action: string;
  variant: "default" | "destructive";
  onConfirm: () => void;
}

const INITIAL_CONFIRM: ConfirmState = {
  open: false,
  title: "",
  description: "",
  action: "",
  variant: "default",
  onConfirm: () => {},
};

export function OrderHeader({ order }: { order: EnrichedOrder }) {
  const [printOpen, setPrintOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(INITIAL_CONFIRM);

  const showConfirm = (
    title: string,
    description: string,
    action: string,
    variant: "default" | "destructive" = "default"
  ) => {
    setConfirm({
      open: true,
      title,
      description,
      action,
      variant,
      onConfirm: () => {
        // TODO: wire to real API
        setConfirm(INITIAL_CONFIRM);
      },
    });
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{order.id}</h1>
            <StatusBadge status={order.status} className="px-2.5 py-0.5 text-xs" />
            {order.driver && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                <UserPlus className="h-3 w-3" />
                {order.driver}
              </span>
            )}
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order date
              </dt>
              <dd className="mt-1 font-semibold text-foreground">{order.date}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order time
              </dt>
              <dd className="mt-1 font-semibold text-foreground">{order.time}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Channel
              </dt>
              <dd className="mt-1 font-semibold capitalize text-foreground">{order.channel}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(160px,220px)_auto_auto] lg:flex lg:items-center">
          <Select defaultValue={order.zone}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No Zone">No Zone</SelectItem>
              <SelectItem value="Zone 50">Zone 50</SelectItem>
              <SelectItem value="Al Sadd">Al Sadd</SelectItem>
              <SelectItem value="Lusail">Lusail</SelectItem>
              <SelectItem value="West Bay">West Bay</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 bg-background" onClick={() => setPrintOpen(true)}>
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>

          {/* ── Grouped Actions Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background font-semibold">
                <Zap className="h-4 w-4" />
                Actions
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1.5">
              {/* ── Picking Actions ── */}
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Picking
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Force to Picking",
                      "This will override the current status and move the order to the Picking queue. Any existing picker assignment will be cleared.",
                      "Force to Picking"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </div>
                  Force to Picking
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Reset Picker Assignment",
                      "The currently assigned picker will be removed. The order will remain in its current status but become unassigned.",
                      "Reset Assignment"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </div>
                  Reset Picker Assignment
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* ── Packing Actions ── */}
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Packing
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Force to Packing",
                      "This will skip picking verification and force the order directly into the Packing queue.",
                      "Force to Packing"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <PackageCheck className="h-3.5 w-3.5" />
                  </div>
                  Force to Packing
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Reset Packer Assignment",
                      "The currently assigned packer will be removed. The order will remain in its current status but become unassigned.",
                      "Reset Assignment"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </div>
                  Reset Packer Assignment
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Rollback to Picked",
                      "This will revert the order status back to 'Picked', removing any packer progress. Use this if packing needs to be redone.",
                      "Rollback"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Undo2 className="h-3.5 w-3.5" />
                  </div>
                  Rollback to Picked
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* ── Driver Actions ── */}
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Driver
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Adjust Driver Status",
                      "Manually update the driver delivery status for this order. This overrides the normal delivery workflow.",
                      "Adjust Status"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Truck className="h-3.5 w-3.5" />
                  </div>
                  Adjust Driver Status
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* ── Payment Actions ── */}
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Payment
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Update Payment Details",
                      "Modify the payment method, amount, or reconciliation status for this order.",
                      "Update Payment"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  Update Payment Details
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* ── Warehouse Actions ── */}
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Warehouse
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium"
                  onClick={() =>
                    showConfirm(
                      "Bypass Warehouse (Direct)",
                      "Skip the warehouse fulfillment workflow entirely and mark this order for direct shipping. This cannot be easily undone.",
                      "Bypass Warehouse",
                      "destructive"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Warehouse className="h-3.5 w-3.5" />
                  </div>
                  Bypass Warehouse (Direct)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-destructive focus:text-destructive"
                  onClick={() =>
                    showConfirm(
                      "Cancel Allocation",
                      "This will cancel all warehouse allocations for this order. Items will be released back to inventory. This action is irreversible.",
                      "Cancel Allocation",
                      "destructive"
                    )
                  }
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                  </div>
                  Cancel Allocation
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Payment" value={order.payment.balance > 0 ? "Balance due" : "Paid"} />
        <SummaryItem label="Delivery" value={order.driverStatus ?? order.status} />
        <SummaryItem
          label="Items"
          value={`${order.itemsList.length} line item${order.itemsList.length === 1 ? "" : "s"}`}
        />
        <SummaryItem label="TAT" value={order.tat} />
      </div>

      <PrintInvoiceDialog 
        open={printOpen} 
        onOpenChange={setPrintOpen} 
        orders={[order]} 
      />

      {/* ── Confirmation Dialog ── */}
      <AlertDialog open={confirm.open} onOpenChange={(open) => !open && setConfirm(INITIAL_CONFIRM)}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              {confirm.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirm.onConfirm}
              className={
                confirm.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                  : "font-semibold"
              }
            >
              {confirm.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
