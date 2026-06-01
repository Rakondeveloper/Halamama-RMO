import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function AssignDriverDialog({
  open,
  onOpenChange,
  selectedCount,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAssign: (driver: string, force: boolean) => void;
}) {
  const [driver, setDriver] = useState<string>("");
  const [force, setForce] = useState(false);

  const handleAssign = () => {
    if (!driver) return;
    onAssign(driver, force);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl">
        <div className="p-7">
          <DialogHeader className="mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4 sm:mx-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center sm:text-left">
              Assign Driver
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left text-muted-foreground mt-1.5">
              Select a delivery partner for {selectedCount} selected order{selectedCount !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground">Select Driver</Label>
              <Select value={driver} onValueChange={setDriver}>
                <SelectTrigger className="w-full h-12 rounded-xl bg-muted/40 border-transparent hover:bg-muted focus:bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all font-medium text-foreground">
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                  <SelectItem value="irshad" className="rounded-lg font-medium py-2.5">Irshad</SelectItem>
                  <SelectItem value="farshad" className="rounded-lg font-medium py-2.5">Farshad</SelectItem>
                  <SelectItem value="nassim" className="rounded-lg font-medium py-2.5">Nassim</SelectItem>
                  <SelectItem value="adhil" className="rounded-lg font-medium py-2.5">Adhil</SelectItem>
                  <SelectItem value="driver1" className="rounded-lg font-medium py-2.5">Driver 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label 
              className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                force 
                  ? "border-emerald-500/50 bg-emerald-500/5 shadow-sm" 
                  : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
              }`}
            >
              <Checkbox
                checked={force}
                onCheckedChange={(checked) => setForce(checked as boolean)}
                className={`mt-0.5 rounded-sm transition-colors ${force ? "data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white" : ""}`}
              />
              <div className="flex-1 space-y-1">
                <p className={`text-sm font-semibold leading-none ${force ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"}`}>
                  Force assignment
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Override any existing driver assignments
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-7 py-5">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl font-semibold h-11 px-6 shadow-sm border-border/60">
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!driver}
            className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md font-semibold h-11 px-8 transition-all"
          >
            Confirm Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
