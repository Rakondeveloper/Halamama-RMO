/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Vendor Locations Store — Database Layer                                      ║
 * ║                                                                              ║
 * ║  Manages the partner vendor physical locations list in localStorage.          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

const STORAGE_KEY = "hm_vendor_locations";

const SEED_LOCATIONS = [
  {
    id: "vl-1",
    locationId: "loc-001",
    vendorName: "Baby Boutique",
    locationName: "West Bay Showroom",
    virtualStock: "VS",
    address: "West Bay Main Road, Tower A, Ground Floor",
    city: "Doha",
    country: "Qatar",
    latitude: 25.3183,
    longitude: 51.5218,
    contactPerson: "Hassan Ali",
    phone: "55002200",
    email: "vl@halamama.com",
    operatingHours: "09:00 - 22:00",
    status: "Active",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "vl-2",
    locationId: "loc-002",
    vendorName: "Stokke Boutique",
    locationName: "Tawar Mall Showroom",
    virtualStock: "VS",
    address: "Tawar Mall, Gate 3, Ground Floor",
    city: "Doha",
    country: "Qatar",
    latitude: 25.3340,
    longitude: 51.4880,
    contactPerson: "Mariam Al-Khor",
    phone: "55003344",
    email: "stokke@halamama.com",
    operatingHours: "10:00 - 22:00",
    status: "Active",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "vl-3",
    locationId: "loc-003",
    vendorName: "Chicco Boutique",
    locationName: "Place Vendôme Showroom",
    virtualStock: "VS",
    address: "Place Vendôme Mall, Luxury Section",
    city: "Lusail",
    country: "Qatar",
    latitude: 25.3940,
    longitude: 51.5280,
    contactPerson: "Jean-Paul",
    phone: "55005566",
    email: "chicco@halamama.com",
    operatingHours: "10:00 - 22:00",
    status: "Active",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  }
];

export function getVendorLocations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LOCATIONS));
      return SEED_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_LOCATIONS;
  }
}

export function saveVendorLocations(locations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  localStorage.setItem("hm_vendor_locations_sync", Date.now().toString());
}
