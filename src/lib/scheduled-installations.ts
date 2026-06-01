/**
 * Scheduled Installations Store
 *
 * A simple reactive store that holds the list of scheduled installations.
 * Both the FulfillmentSection (to schedule items) and the ScheduledInstallations
 * page (to view/manage them) share this store.
 */

export interface ScheduledItem {
  /** Unique id for this scheduled entry */
  id: string;
  /** The order this item belongs to */
  orderId: string;
  /** Product name */
  productName: string;
  /** SKU */
  sku: string;
  /** Product image URL */
  image: string;
  /** Customer name */
  customerName: string;
  /** Scheduled status: "Pending" or "Assigned" */
  status: "Pending" | "Assigned";
  /** When this installation was scheduled */
  scheduledAt: string;
  /** Assigned driver/installer */
  assignedDriver?: string | null;
}

type Listener = () => void;

let _items: ScheduledItem[] = [
  // Pre-populate with some mock data
  {
    id: "si-1",
    orderId: "HM59240",
    productName: "Bestway Steel Pro Frame Pool Set (12' x 30\")",
    sku: "56416",
    image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=100&h=100&fit=crop",
    customerName: "ayah sukik",
    status: "Pending",
    scheduledAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "si-2",
    orderId: "HM59240",
    productName: "Intex Prism Frame Rectangular Pool Set",
    sku: "26790",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=100&h=100&fit=crop",
    customerName: "ayah sukik",
    status: "Pending",
    scheduledAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "si-3",
    orderId: "HM60101",
    productName: "Nip Soother With Hook (Blue)",
    sku: "412217",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=100&h=100&fit=crop",
    customerName: "Maha Al-Kaabi",
    status: "Pending",
    scheduledAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "si-4",
    orderId: "HM59243",
    productName: "Happy Hop Double Water Slide – Deluxe",
    sku: "9029",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop",
    customerName: "Layla Hassan",
    status: "Assigned",
    scheduledAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    assignedDriver: "irshad",
  },
  {
    id: "si-5",
    orderId: "HM60103",
    productName: "Bestway Flowclear Pool Cover (12ft)",
    sku: "58034",
    image: "https://images.unsplash.com/photo-1560090995-01b72abb4c06?w=100&h=100&fit=crop",
    customerName: "Faisal Al-Marri",
    status: "Pending",
    scheduledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "si-6",
    orderId: "HM60104",
    productName: "Summer Waves Frame Pool Pump 800 GPH",
    sku: "P58800",
    image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=100&h=100&fit=crop",
    customerName: "Hessa Al-Jaber",
    status: "Assigned",
    scheduledAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    assignedDriver: "farshad",
  },
];

const _listeners: Set<Listener> = new Set();

function _notify() {
  _listeners.forEach((fn) => fn());
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/** Get current snapshot of scheduled items. */
export function getSnapshot(): ScheduledItem[] {
  return _items;
}

/** Schedule a new installation item. */
export function scheduleItem(item: Omit<ScheduledItem, "id" | "status" | "scheduledAt">): ScheduledItem {
  const newItem: ScheduledItem = {
    ...item,
    id: `si-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "Pending",
    scheduledAt: new Date().toISOString(),
    assignedDriver: null,
  };
  _items = [..._items, newItem];
  _notify();
  return newItem;
}

/** Remove a scheduled installation. */
export function removeItem(id: string) {
  _items = _items.filter((i) => i.id !== id);
  _notify();
}

/** Assign a driver to selected items. */
export function assignDriver(ids: string[], driver: string) {
  _items = _items.map((item) =>
    ids.includes(item.id)
      ? { ...item, assignedDriver: driver, status: "Assigned" as const }
      : item,
  );
  _notify();
}

/** Check if a product (by orderId + sku) is already scheduled. */
export function isItemScheduled(orderId: string, sku: string): boolean {
  return _items.some((i) => i.orderId === orderId && i.sku === sku);
}

/** Available drivers / installers for assignment. */
export const AVAILABLE_DRIVERS = [
  "minhal",
  "rizwan_",
  "mwd_shambu",
  "mwd_naveed",
  "mwd_nishad",
  "shijar",
  "waseem",
  "chand",
  "omar",
  "saifu",
  "irshad",
  "farshad",
  "nassim",
];
