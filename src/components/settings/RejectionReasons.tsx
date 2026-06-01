import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RejectionReason {
  id: string;
  text: string;
  type: "driver" | "outlet" | "both";
  sortOrder: number;
}

const MOCK_REASONS: RejectionReason[] = [
  { id: "1", text: "Other", type: "both", sortOrder: 9999 },
  { id: "2", text: "Customer not available", type: "driver", sortOrder: 100 },
  { id: "3", text: "Wrong address", type: "driver", sortOrder: 200 },
  { id: "4", text: "Item damaged", type: "outlet", sortOrder: 300 },
  { id: "5", text: "Out of stock", type: "outlet", sortOrder: 400 },
];

const TYPE_COLORS: Record<string, string> = {
  driver: "bg-info/12 text-info",
  outlet: "bg-warning/12 text-warning",
  both: "bg-primary/12 text-primary",
};

export function RejectionReasons() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(
    () =>
      MOCK_REASONS.filter((r) => {
        const matchesSearch = r.text.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || r.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [search, typeFilter],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Rejection Reasons</h2>
          <p className="text-sm text-muted-foreground">
            Manage predefined rejection reasons for drivers and pharmacies
          </p>
        </div>
        <button
          id="add-reason-btn"
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Reason
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="reason-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reasons…"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background transition-colors"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger id="type-filter" className="rounded-xl h-10 w-[140px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="outlet">Outlet</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
        <button className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Reason Text</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Sort Order</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">No reasons found.</td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{r.text}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold ${TYPE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.sortOrder}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-8 w-8 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 grid place-items-center transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
