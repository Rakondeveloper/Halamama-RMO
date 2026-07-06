import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

/** Qatar delivery zones used by HalaMama */
const ZONES = [
  { value: "al-sadd", label: "Al Sadd", area: "Doha" },
  { value: "al-wakrah", label: "Al Wakrah", area: "Al Wakrah" },
  { value: "al-rayyan", label: "Al Rayyan", area: "Al Rayyan" },
  { value: "al-dafna", label: "Al Dafna (West Bay)", area: "Doha" },
  { value: "al-hilal", label: "Al Hilal", area: "Doha" },
  { value: "al-thumama", label: "Al Thumama", area: "Doha" },
  { value: "al-aziziyah", label: "Al Aziziyah", area: "Al Rayyan" },
  { value: "al-gharrafa", label: "Al Gharrafa", area: "Al Rayyan" },
  { value: "old-airport", label: "Old Airport", area: "Doha" },
  { value: "pearl-qatar", label: "The Pearl Qatar", area: "Doha" },
  { value: "lusail", label: "Lusail", area: "Lusail" },
  { value: "umm-salal", label: "Umm Salal", area: "Umm Salal" },
  { value: "al-khor", label: "Al Khor", area: "Al Khor" },
  { value: "al-markhiya", label: "Al Markhiya", area: "Doha" },
  { value: "bin-mahmoud", label: "Bin Mahmoud", area: "Doha" },
  { value: "madinat-khalifa", label: "Madinat Khalifa", area: "Doha" },
  { value: "muaither", label: "Muaither", area: "Al Rayyan" },
  { value: "zone-50", label: "Zone 50", area: "Doha" },
  { value: "zone-38", label: "Zone 38", area: "Doha" },
  { value: "zone-69", label: "Zone 69", area: "Doha" },
];

export function AssignZoneDialog({
  open,
  onOpenChange,
  selectedCount,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAssign: (zone: string, zoneName: string, overrideExisting: boolean) => void;
}) {
  const [zone, setZone] = useState<string>("");
  const [override, setOverride] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredZones = useMemo(() => {
    if (!searchQuery.trim()) return ZONES;
    const q = searchQuery.toLowerCase();
    return ZONES.filter(
      (z) =>
        z.label.toLowerCase().includes(q) ||
        z.area.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedZone = ZONES.find((z) => z.value === zone);

  const handleAssign = () => {
    if (!zone || !selectedZone) return;
    onAssign(zone, selectedZone.label, override);
    onOpenChange(false);
    // Reset state
    setZone("");
    setOverride(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[440px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 sm:p-7 overflow-y-auto">
          <DialogHeader className="mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mb-4 sm:mx-0">
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center sm:text-left">
              Assign Zone
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left text-muted-foreground mt-1.5">
              Assign a delivery zone to {selectedCount} selected order{selectedCount !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Zone selector */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground">Select Zone</Label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="w-full h-12 rounded-xl bg-muted/40 border-transparent hover:bg-muted focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium text-foreground">
                  <SelectValue placeholder="Choose a delivery zone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-xl max-h-[280px]">
                  {/* Search input inside the dropdown */}
                  <div className="px-2 pb-2 pt-1 sticky top-0 bg-popover z-10">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search zones..."
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted/50 border border-border/50 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/40 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filteredZones.map((z) => (
                    <SelectItem key={z.value} value={z.value} className="rounded-lg font-medium py-2.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                        <span>{z.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">({z.area})</span>
                      </div>
                    </SelectItem>
                  ))}
                  {filteredZones.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      No zones match "{searchQuery}"
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selected zone preview */}
            {selectedZone && (
              <div className="flex items-center gap-3 rounded-xl bg-blue-500/5 border border-blue-500/20 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{selectedZone.label}</p>
                  <p className="text-[11px] text-muted-foreground">Area: {selectedZone.area}</p>
                </div>
              </div>
            )}

            {/* Override checkbox */}
            <label
              className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                override
                  ? "border-blue-500/50 bg-blue-500/5 shadow-sm"
                  : "border-border/60 bg-card hover:bg-muted/50 hover:border-border"
              }`}
            >
              <Checkbox
                checked={override}
                onCheckedChange={(checked) => setOverride(checked as boolean)}
                className={`mt-0.5 rounded-sm transition-colors ${override ? "data-[state=checked]:bg-blue-600 data-[state=checked]:text-white" : ""}`}
              />
              <div className="flex-1 space-y-1">
                <p className={`text-sm font-semibold leading-none ${override ? "text-blue-900 dark:text-blue-100" : "text-foreground"}`}>
                  Override existing zones
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Replace any previously assigned zones on selected orders
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/40 bg-muted/20 px-5 py-4 sm:px-7 sm:py-5 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl font-semibold h-11 px-6 shadow-sm border-border/60">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!zone}
            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md font-semibold h-11 px-8 transition-all"
          >
            Assign Zone
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
