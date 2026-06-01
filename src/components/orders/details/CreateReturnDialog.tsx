import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EnrichedOrder } from "@/lib/orders";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CreateReturnDialog({
  order,
  open,
  onOpenChange,
}: {
  order: EnrichedOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [actionType, setActionType] = useState<"refund" | "replace">("refund");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl">Create Return / Replacement</DialogTitle>
            <DialogDescription>
              Select items from the order and choose whether they should be returned for a refund or replaced.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Select Items */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Items</Label>
              <div className="max-h-[240px] overflow-y-auto space-y-2 rounded-md border border-border bg-muted/10 p-2">
                {order.itemsList.map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50",
                      selectedItems.has(item.id) ? "border-primary bg-primary/5" : "border-transparent bg-card"
                    )}
                  >
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1 leading-none">
                      <p className="text-sm font-medium leading-none text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      Qty: {item.qty}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Action Type Segmented Control */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Action Type</Label>
                <div className="flex rounded-md bg-muted/50 p-1 border border-border">
                  <button
                    className={cn(
                      "flex-1 rounded-sm py-2 text-sm font-medium transition-all",
                      actionType === "refund"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActionType("refund")}
                  >
                    Refund
                  </button>
                  <button
                    className={cn(
                      "flex-1 rounded-sm py-2 text-sm font-medium transition-all",
                      actionType === "replace"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActionType("replace")}
                  >
                    Replace
                  </button>
                </div>
              </div>

              {/* Reason Dropdown */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Reason</Label>
                <Select>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged / Defective</SelectItem>
                    <SelectItem value="wrong">Wrong Item Sent</SelectItem>
                    <SelectItem value="expiry">Near Expiry / Expired</SelectItem>
                    <SelectItem value="mind">Customer Changed Mind</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Notes (optional)</Label>
              <Textarea placeholder="Additional details..." className="min-h-[100px] resize-none bg-muted/10" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={selectedItems.size === 0}>
            {actionType === "refund" ? "Create Refund" : "Create Replacement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
