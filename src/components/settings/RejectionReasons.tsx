import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, RefreshCw, X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { settingsApi } from "@/lib/api";
import type { RejectionReason } from "@/lib/api/settings";

const TYPE_COLORS: Record<string, string> = {
  driver: "bg-info/12 text-info",
  outlet: "bg-warning/12 text-warning",
  both: "bg-primary/12 text-primary",
};

const EMPTY_FORM = { text: "", type: "driver" as RejectionReason["type"], sortOrder: 500 };

/* ── Dialog for Add / Edit ── */
function ReasonDialog({
  reason,
  onClose,
  onSave,
}: {
  reason: RejectionReason | null;
  onClose: () => void;
  onSave: (data: Omit<RejectionReason, "id">) => Promise<void>;
}) {
  const isEdit = !!reason;
  const [form, setForm] = useState({
    text: reason?.text ?? "",
    type: reason?.type ?? ("driver" as RejectionReason["type"]),
    sortOrder: reason?.sortOrder ?? 500,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) { setError("Reason text is required."); return; }
    
    setSaving(true);
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err.message || "Failed to save reason");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-card border border-border shadow-elevated animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Reason" : "Add Rejection Reason"}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center" disabled={saving}>
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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason Text</label>
            <input
              value={form.text}
              onChange={(e) => { setForm({ ...form, text: e.target.value }); setError(""); }}
              placeholder="e.g. Customer not available"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-primary/40 focus:bg-card transition-colors"
              autoFocus
              disabled={saving}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RejectionReason["type"] })} disabled={saving}>
                <SelectTrigger className="rounded-xl h-10 border border-border bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="outlet">Outlet</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-primary/40 focus:bg-card transition-colors"
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 transition-opacity" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Reason"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

export function RejectionReasons() {
  const [reasons, setReasons] = React.useState<RejectionReason[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingReason, setEditingReason] = React.useState<RejectionReason | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [refreshSpin, setRefreshSpin] = React.useState(false);

  const fetchReasons = async () => {
    try {
      const data = await settingsApi.fetchRejectionReasons();
      setReasons(data);
    } catch (error) {
      console.error("Failed to fetch rejection reasons", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReasons();
  }, []);

  const handleRefresh = async () => {
    setRefreshSpin(true);
    await fetchReasons();
    setRefreshSpin(false);
  };

  const handleSave = async (data: Omit<RejectionReason, "id">) => {
    if (editingReason) {
      const updated = await settingsApi.updateRejectionReason(editingReason.id, data);
      setReasons(reasons.map((r) => (r.id === editingReason.id ? updated : r)));
    } else {
      const created = await settingsApi.createRejectionReason(data);
      setReasons([...reasons, created]);
    }
    setShowDialog(false);
    setEditingReason(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await settingsApi.deleteRejectionReason(id);
      setReasons(reasons.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const filtered = useMemo(
    () =>
      reasons
        .filter((r) => {
          const matchesSearch = r.text.toLowerCase().includes(search.toLowerCase());
          const matchesType = typeFilter === "all" || r.type === typeFilter;
          return matchesSearch && matchesType;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [reasons, search, typeFilter],
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
          onClick={() => { setEditingReason(null); setShowDialog(true); }}
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
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Reason Text</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Sort Order</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                    No reasons found.{search && " Try clearing the search."}
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-3.5 font-medium">{r.text}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-semibold ${TYPE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{r.sortOrder}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => { setEditingReason(r); setShowDialog(true); }}
                        className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete with confirmation */}
                      {deleteConfirm === r.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(r.id)}
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
                          onClick={() => setDeleteConfirm(r.id)}
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
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} of {reasons.length} reason{reasons.length !== 1 ? "s" : ""}</span>
          <span>Stored locally · syncs with RouteMyOrder</span>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {showDialog && (
        <ReasonDialog
          reason={editingReason}
          onClose={() => { setShowDialog(false); setEditingReason(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
