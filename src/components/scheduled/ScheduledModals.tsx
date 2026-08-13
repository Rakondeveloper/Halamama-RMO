import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type ScheduledItem } from "@/lib/scheduled-installations";

interface AssignDriverDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedCount: number;
  driversList: string[];
  selectedDriver: string | null;
  setSelectedDriver: (driver: string | null) => void;
  onAssign: () => void;
}

export function AssignDriverDialog({
  isOpen,
  setIsOpen,
  selectedCount,
  driversList,
  selectedDriver,
  setSelectedDriver,
  onAssign,
}: AssignDriverDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Assign Driver</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            Select a driver to assign to the {selectedCount} selected installation(s).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="font-bold text-sm text-slate-700 dark:text-slate-300">Select Driver</Label>
            <Select value={selectedDriver || ""} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Choose a driver..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-background border-border">
                {driversList.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl h-11 cursor-pointer">
            Cancel
          </Button>
          <Button onClick={onAssign} disabled={!selectedDriver} className="rounded-xl h-11 cursor-pointer bg-primary hover:bg-primary/95">
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CancelInstallationDialogProps {
  item: ScheduledItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelInstallationDialog({
  item,
  onClose,
  onConfirm,
}: CancelInstallationDialogProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[500px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
        <div className="p-5 sm:p-7">
          <DialogHeader className="mb-5 text-left">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
              Cancel Installation Schedule
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              Are you sure you want to cancel the scheduled installation for this item?
            </DialogDescription>
          </DialogHeader>

          {item && (
            <div className="flex items-center gap-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 dark:border-slate-700 bg-background overflow-hidden">
                <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.productName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Order ID: {item.orderId.replace("HM", "")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-800/10 px-5 sm:px-7 py-4 sm:py-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl font-bold h-11 text-sm shadow-sm border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            No, Keep It
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto rounded-xl bg-[#e3292b] hover:bg-[#c92426] text-white shadow-md font-bold h-11 text-sm px-6 transition-all cursor-pointer"
          >
            Yes, Cancel Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
