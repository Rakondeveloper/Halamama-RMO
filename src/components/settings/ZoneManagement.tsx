import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, RefreshCw, MapPin, Users } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  vertices: number;
  active: boolean;
}

const MOCK_ZONES: Zone[] = [
  { id: "1", name: "ZONE 2", vertices: 0, active: true },
  { id: "2", name: "ZONE 3", vertices: 0, active: true },
  { id: "3", name: "Zone 42", vertices: 0, active: true },
  { id: "4", name: "Downtown", vertices: 12, active: true },
  { id: "5", name: "Industrial Area", vertices: 8, active: false },
];

export function ZoneManagement() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => MOCK_ZONES.filter((z) => z.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Zone Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage geographic zones and driver allocation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0">
            <MapPin className="h-3.5 w-3.5" />
            Find Zone
          </button>
          <button
            id="add-zone-btn"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Zone
          </button>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="zone-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search zones…"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background transition-colors"
          />
        </div>
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
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Zone Name</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Vertices</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Active</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">No zones found.</td>
                </tr>
              )}
              {filtered.map((z) => (
                <tr key={z.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{z.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{z.vertices}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold ${z.active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${z.active ? "bg-success" : "bg-muted-foreground"}`} />
                      {z.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors" title="Assign Drivers">
                        <Users className="h-3.5 w-3.5" />
                      </button>
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
