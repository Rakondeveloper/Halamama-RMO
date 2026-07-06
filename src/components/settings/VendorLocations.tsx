import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  X,
  Check,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getVendorLocations,
  addVendorLocation,
  updateVendorLocation,
  deleteVendorLocation,
  type VendorLocation,
} from "@/lib/vendor-locations";

export function VendorLocations() {
  const [locations, setLocations] = useState<VendorLocation[]>(() => getVendorLocations());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<VendorLocation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refreshLocations = () => setLocations(getVendorLocations());

  const filteredLocations = useMemo(() => {
    return locations.filter((l) => {
      const matchesSearch =
        !search ||
        l.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        l.locationName.toLowerCase().includes(search.toLowerCase()) ||
        l.locationId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [locations, search, statusFilter]);

  const handleDelete = (id: string) => {
    deleteVendorLocation(id);
    refreshLocations();
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (id: string) => {
    const loc = locations.find((l) => l.id === id);
    if (loc) {
      updateVendorLocation(id, { status: loc.status === "Active" ? "Inactive" : "Active" });
      refreshLocations();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Vendor Locations</h2>
            <span className="h-6 px-2 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider grid place-items-center">
              {locations.length} Locations
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure partner boutique details, coordinates, and contact details for RouteMyOrder dispatching.
          </p>
        </div>
        <button
          onClick={() => { setEditingLocation(null); setShowAddDialog(true); }}
          className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Vendor Location
        </button>
      </div>

      {/* Table & Search Filters */}
      <section className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-border">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search vendor, location name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:border-primary/40"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredLocations.length} of {locations.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                <th className="text-left font-semibold px-5 py-3">Vendor / Location</th>
                <th className="text-left font-semibold py-3">Location ID</th>
                <th className="text-left font-semibold py-3">Virtual Stock</th>
                <th className="text-left font-semibold py-3">Contact Person</th>
                <th className="text-left font-semibold py-3">Phone & Email</th>
                <th className="text-center font-semibold py-3">Status</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 grid place-items-center shrink-0">
                        <Building className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{l.vendorName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                          {l.locationName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-xs">{l.locationId}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center h-5 px-2 rounded bg-muted text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border">
                      {l.virtualStock}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {l.contactPerson}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="space-y-0.5">
                      <div className="text-xs flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {l.phone}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground/60" />
                        {l.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(l.id)}
                      className={cn(
                        "inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-semibold transition-colors",
                        l.status === "Active"
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", l.status === "Active" ? "bg-success" : "bg-muted-foreground")} />
                      {l.status}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingLocation(l); setShowAddDialog(true); }}
                        className="h-7 w-7 rounded-md hover:bg-muted grid place-items-center text-foreground"
                        title="Edit Location"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirm === l.id ? (
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="h-7 w-7 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 grid place-items-center"
                            title="Confirm delete"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="h-7 w-7 rounded-md hover:bg-muted grid place-items-center"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(l.id)}
                          className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive grid place-items-center transition-colors"
                          title="Delete Location"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLocations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No vendor locations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Location Dialog */}
      {showAddDialog && (
        <LocationDialog
          location={editingLocation}
          onClose={() => { setShowAddDialog(false); setEditingLocation(null); }}
          onSave={() => { refreshLocations(); setShowAddDialog(false); setEditingLocation(null); }}
        />
      )}
    </div>
  );
}

interface LocationDialogProps {
  location: VendorLocation | null;
  onClose: () => void;
  onSave: () => void;
}

function LocationDialog({ location, onClose, onSave }: LocationDialogProps) {
  const isEdit = !!location;
  const [form, setForm] = useState({
    vendorName: location?.vendorName || "",
    locationName: location?.locationName || "",
    virtualStock: location?.virtualStock || "VS",
    address: location?.address || "",
    city: location?.city || "Doha",
    country: location?.country || "Qatar",
    latitude: location?.latitude?.toString() || "25.2854",
    longitude: location?.longitude?.toString() || "51.5310",
    contactPerson: location?.contactPerson || "",
    phone: location?.phone || "",
    email: location?.email || "",
    operatingHours: location?.operatingHours || "09:00 - 22:00",
    status: location?.status || "Active",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.vendorName || !form.locationName || !form.address || !form.contactPerson || !form.phone || !form.email) {
      setError("Please fill out all required fields.");
      return;
    }

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setError("Coordinates must be valid numbers.");
      return;
    }

    if (isEdit && location) {
      updateVendorLocation(location.id, {
        vendorName: form.vendorName,
        locationName: form.locationName,
        virtualStock: form.virtualStock,
        address: form.address,
        city: form.city,
        country: form.country,
        latitude: lat,
        longitude: lng,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        operatingHours: form.operatingHours,
        status: form.status as VendorLocation["status"],
      });
    } else {
      addVendorLocation({
        vendorName: form.vendorName,
        locationName: form.locationName,
        virtualStock: form.virtualStock,
        address: form.address,
        city: form.city,
        country: form.country,
        latitude: lat,
        longitude: lng,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        operatingHours: form.operatingHours,
        status: form.status as VendorLocation["status"],
      });
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl bg-card border border-border shadow-elevated animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? `Edit Boutique — ${location?.locationId}` : "Onboard New Partner Location"}
          </h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center">
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Vendor Name *
              </label>
              <input
                value={form.vendorName}
                onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                placeholder="e.g. Baby Boutique"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none focus:border-primary/40 focus:bg-card transition-colors text-foreground"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Location Name *
              </label>
              <input
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                placeholder="e.g. West Bay Showroom"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none focus:border-primary/40 focus:bg-card transition-colors text-foreground"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fulfillment stock *
              </label>
              <input
                value={form.virtualStock}
                onChange={(e) => setForm({ ...form, virtualStock: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/20 text-muted-foreground cursor-not-allowed font-mono"
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                City
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Country
              </label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pickup Address *
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. West Bay Tower A, Ground Floor"
              className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none focus:border-primary/40 focus:bg-card transition-colors text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                Latitude (GPS)
              </label>
              <input
                type="number"
                step="0.000001"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="25.2854"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                Longitude (GPS)
              </label>
              <input
                type="number"
                step="0.000001"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="51.5310"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Person *
              </label>
              <input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="Hassan Ali"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Phone *
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="55002200"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vl@halamama.com"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> Operating Hours
              </label>
              <input
                value={form.operatingHours}
                onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                placeholder="09:00 - 22:00"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/30 focus:outline-none text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Location Status
              </label>
              <div className="flex items-center gap-2 h-10">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: form.status === "Active" ? "Inactive" : "Active" })}
                  className={cn(
                    "h-5 w-9 shrink-0 rounded-full transition-colors relative",
                    form.status === "Active" ? "bg-success" : "bg-muted-foreground/30",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      form.status === "Active" ? "translate-x-4" : "translate-x-0.5",
                    )}
                  />
                </button>
                <span className="text-xs font-semibold text-muted-foreground">
                  {form.status === "Active" ? "Active (Accepting Orders)" : "Inactive (Bypassed)"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 transition-opacity"
            >
              {isEdit ? "Save boutique" : "Onboard boutique"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
