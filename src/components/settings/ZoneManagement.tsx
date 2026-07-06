import { useState, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, RefreshCw, MapPin, Users,
  X, Check, ToggleLeft, ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Zone {
  id: string;
  name: string;
  vertices: number;
  active: boolean;
  drivers: string[];
}

const STORAGE_KEY = "hm_zones";

const DEFAULT_ZONES: Zone[] = [
  { id: "1", name: "ZONE 2", vertices: 0, active: true, drivers: [] },
  { id: "2", name: "ZONE 3", vertices: 0, active: true, drivers: [] },
  { id: "3", name: "Zone 42", vertices: 0, active: true, drivers: [] },
  { id: "4", name: "Downtown", vertices: 12, active: true, drivers: ["irshad", "farshad"] },
  { id: "5", name: "Industrial Area", vertices: 8, active: false, drivers: [] },
];

function loadZones(): Zone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ZONES;
}

function saveZones(zones: Zone[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

/* ── Zone Add/Edit Dialog ── */
function ZoneDialog({
  zone,
  onClose,
  onSave,
}: {
  zone: Zone | null;
  onClose: () => void;
  onSave: (data: Omit<Zone, "id">) => void;
}) {
  const isEdit = !!zone;
  const [form, setForm] = useState({
    name: zone?.name ?? "",
    vertices: zone?.vertices ?? 0,
    active: zone?.active ?? true,
    drivers: zone?.drivers ?? [],
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Zone name is required."); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-card border border-border shadow-elevated animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Zone" : "Add New Zone"}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive font-medium">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zone Name</label>
            <input
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }}
              placeholder="e.g. West Bay"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-primary/40 focus:bg-card transition-colors"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vertices (boundary points)</label>
            <input
              type="number"
              min={0}
              value={form.vertices}
              onChange={(e) => setForm({ ...form, vertices: Number(e.target.value) })}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-primary/40 focus:bg-card transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {form.active
                ? <ToggleRight className="h-6 w-6 text-success" />
                : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
              <span className={form.active ? "text-success" : "text-muted-foreground"}>
                {form.active ? "Active" : "Inactive"}
              </span>
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 transition-opacity">
              {isEdit ? "Save Changes" : "Add Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Assign Drivers Dialog ── */
function AssignDriversDialog({
  zone,
  onClose,
  onSave,
}: {
  zone: Zone;
  onClose: () => void;
  onSave: (drivers: string[]) => void;
}) {
  const ALL_DRIVERS = ["irshad", "farshad", "nassim", "mwd_nishad", "mwd_naveed"];
  const [selected, setSelected] = useState<string[]>(zone.drivers ?? []);

  const toggle = (name: string) =>
    setSelected((prev) => prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-card border border-border shadow-elevated animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Assign Drivers</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Zone: {zone.name}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {ALL_DRIVERS.map((d) => (
            <label key={d} className="flex items-center gap-3 h-10 px-3 rounded-xl hover:bg-muted cursor-pointer transition-colors">
              <div
                className={cn(
                  "h-4 w-4 rounded border-2 grid place-items-center transition-colors",
                  selected.includes(d) ? "bg-primary border-primary" : "border-border",
                )}
                onClick={() => toggle(d)}
              >
                {selected.includes(d) && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
              <span className="text-sm font-medium capitalize">{d}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(selected)}
            className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 transition-opacity"
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

export function ZoneManagement() {
  const [zones, setZones] = useState<Zone[]>(() => loadZones());
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [assigningZone, setAssigningZone] = useState<Zone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [refreshSpin, setRefreshSpin] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [showFind, setShowFind] = useState(false);

  const persist = (updated: Zone[]) => {
    saveZones(updated);
    setZones(updated);
  };

  const handleRefresh = () => {
    setRefreshSpin(true);
    setZones(loadZones());
    setTimeout(() => setRefreshSpin(false), 600);
  };

  const handleSave = (data: Omit<Zone, "id">) => {
    if (editingZone) {
      persist(zones.map((z) => (z.id === editingZone.id ? { ...editingZone, ...data } : z)));
    } else {
      persist([...zones, { id: `z${Date.now()}`, ...data }]);
    }
    setShowDialog(false);
    setEditingZone(null);
  };

  const handleDelete = (id: string) => {
    persist(zones.filter((z) => z.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleActive = (id: string) => {
    persist(zones.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));
  };

  const handleAssignDrivers = (drivers: string[]) => {
    if (assigningZone) {
      persist(zones.map((z) => (z.id === assigningZone.id ? { ...z, drivers } : z)));
    }
    setAssigningZone(null);
  };

  const filtered = useMemo(
    () => zones.filter((z) => z.name.toLowerCase().includes(search.toLowerCase())),
    [zones, search],
  );

  const findResult = findValue.trim()
    ? zones.find((z) => z.name.toLowerCase().includes(findValue.toLowerCase()))
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Zone Management</h2>
          <p className="text-sm text-muted-foreground">Manage geographic zones and driver allocation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFind((v) => !v)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0"
          >
            <MapPin className="h-3.5 w-3.5" />
            Find Zone
          </button>
          <button
            id="add-zone-btn"
            onClick={() => { setEditingZone(null); setShowDialog(true); }}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Zone
          </button>
        </div>
      </div>

      {/* Find Zone inline panel */}
      {showFind && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Find Zone by Name</p>
          <div className="flex items-center gap-2">
            <input
              value={findValue}
              onChange={(e) => setFindValue(e.target.value)}
              placeholder="Type a zone name…"
              className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/40 transition-colors"
              autoFocus
            />
            <button onClick={() => { setFindValue(""); setShowFind(false); }} className="h-9 w-9 rounded-lg border border-border hover:bg-muted grid place-items-center">
              <X className="h-4 w-4" />
            </button>
          </div>
          {findValue && (
            findResult
              ? <p className="text-sm text-success font-medium">✓ Found: <span className="font-bold">{findResult.name}</span> — {findResult.active ? "Active" : "Inactive"}, {findResult.vertices} vertices</p>
              : <p className="text-sm text-muted-foreground">No zone matches "{findValue}".</p>
          )}
        </div>
      )}

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
        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 transition-transform", refreshSpin && "animate-spin")} />
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
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Drivers</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Active</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No zones found.{search && " Try clearing the search."}
                  </td>
                </tr>
              )}
              {filtered.map((z) => (
                <tr key={z.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-3.5 font-medium">{z.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{z.vertices}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {z.drivers && z.drivers.length > 0
                      ? <span className="text-xs">{z.drivers.join(", ")}</span>
                      : <span className="text-xs italic text-muted-foreground/60">None assigned</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleActive(z.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold transition-colors",
                        z.active ? "bg-success/12 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                      title="Click to toggle"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${z.active ? "bg-success" : "bg-muted-foreground"}`} />
                      {z.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* Assign Drivers */}
                      <button
                        onClick={() => setAssigningZone(z)}
                        className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors"
                        title="Assign Drivers"
                      >
                        <Users className="h-3.5 w-3.5" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => { setEditingZone(z); setShowDialog(true); }}
                        className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete with confirmation */}
                      {deleteConfirm === z.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(z.id)}
                            className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 grid place-items-center transition-colors"
                            title="Confirm delete"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(z.id)}
                          className="h-8 w-8 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 grid place-items-center transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          {filtered.length} of {zones.length} zone{zones.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {showDialog && (
        <ZoneDialog
          zone={editingZone}
          onClose={() => { setShowDialog(false); setEditingZone(null); }}
          onSave={handleSave}
        />
      )}

      {/* Assign Drivers Dialog */}
      {assigningZone && (
        <AssignDriversDialog
          zone={assigningZone}
          onClose={() => setAssigningZone(null)}
          onSave={handleAssignDrivers}
        />
      )}
    </div>
  );
}
