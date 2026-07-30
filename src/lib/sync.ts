/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Shared Order Sync — Cross-App Data Bridge                                    ║
 * ║                                                                              ║
 * ║  Enables real-time sync between Admin Dashboard and RouteMyOrder apps        ║
 * ║  using localStorage as a shared "database" and storage events for            ║
 * ║  cross-tab notifications.                                                     ║
 * ║                                                                              ║
 * ║  BACKEND MIGRATION: When the real API is connected, set                       ║
 * ║  VITE_USE_MOCK_DATA=false and all sync code is bypassed.                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { QueryClient } from "@tanstack/react-query";
import { MOCK_ORDERS, type Order, getMockOrderTotal, getMockOrderItems, computeStageArrivedAt, getTodayDateString } from "@/lib/orders";
import { isDemoMode } from "@/lib/api/config";
import { getProducts } from "./products";
import { getVendorLocations } from "./vendor-locations";

const STORAGE_KEY = "hm_shared_orders";
const SYNC_EVENT_KEY = "hm_sync_signal";

let queryClientRef: QueryClient | null = null;

// ─── Routing Resolver ────────────────────────────────────────────────────

function resolveDynamicRouting(itemsList: any[]): any[] {
  if (!itemsList) return [];
  const products = getProducts();
  const prodMap = new Map(products.map(p => [p.sku, p]));
  const vendorLocs = getVendorLocations();
  const vendorMap = new Map(vendorLocs.map(l => [l.locationId, l]));

  return itemsList.map(item => {
    const prod = prodMap.get(item.sku);
    if (prod) {
      if (prod.fulfillmentType === "VS") {
        const vendor = vendorMap.get(prod.locationId);
        return {
          ...item,
          fc: "VL_HMA",
          itemType: "VL_HMA",
          locationId: prod.locationId,
          fcName: vendor ? `${vendor.vendorName} - ${vendor.locationName}` : "Vendor Location",
        };
      } else {
        return {
          ...item,
          fc: prod.locationId,
          itemType: prod.locationId === "MWO" ? "MWH" : "FC",
          locationId: undefined,
          fcName: prod.locationId === "F01"
            ? "Fulfillment Center Hilal"
            : prod.locationId === "F02"
              ? "Main Warehouse - Safety Stock"
              : prod.locationId === "MWO"
                ? "Main Warehouse Outdoor"
                : "Virtual Stock",
        };
      }
    }
    
    // Fallback mapping for old seeded location IDs
    if (item.locationId === "loc-1") {
      return {
        ...item,
        locationId: "loc-001",
        fcName: "Baby Boutique - West Bay Showroom"
      };
    }
    
    return item;
  });
}

// ─── Seeding ─────────────────────────────────────────────────────────────

/** Seed localStorage with MOCK_ORDERS on first load (only in demo mode). */
function seedIfNeeded(): void {
  if (!isDemoMode()) return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const enriched = MOCK_ORDERS.map((o) => ({
      ...o,
      itemsList: getMockOrderItems(o.id, o.items),
      stageArrivedAt: computeStageArrivedAt(o),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
  } else {
    try {
      const parsed = JSON.parse(existing) as Order[];
      let updated = false;

      // Filter out old deleted mock orders
      const validMockIds = new Set(MOCK_ORDERS.map((o) => o.id));
      const filteredParsed = parsed.filter((o) => validMockIds.has(o.id));
      if (filteredParsed.length !== parsed.length) {
        parsed.length = 0;
        parsed.push(...filteredParsed);
        updated = true;
      }

      // Ensure all MOCK_ORDERS are in parsed local storage array
      for (const mockOrder of MOCK_ORDERS) {
        const index = parsed.findIndex((o) => o.id === mockOrder.id);
        if (index === -1) {
          parsed.push({
            ...mockOrder,
            itemsList: getMockOrderItems(mockOrder.id, mockOrder.items),
            total: getMockOrderTotal(mockOrder.id, mockOrder.items, mockOrder.payment),
          });
          updated = true;
        } else {
          const stored = parsed[index];
          if (!stored.itemsList || stored.itemsList.length === 0 || ["HM64110", "HM99001", "HM68233", "HM68234"].includes(mockOrder.id)) {
            stored.itemsList = getMockOrderItems(mockOrder.id, mockOrder.items);
            stored.total = getMockOrderTotal(mockOrder.id, mockOrder.items, stored.payment);
            updated = true;
          }
          if (mockOrder.lat !== undefined && stored.lat === undefined) {
            stored.lat = mockOrder.lat;
            updated = true;
          }
          if (mockOrder.lng !== undefined && stored.lng === undefined) {
            stored.lng = mockOrder.lng;
            updated = true;
          }
          if (mockOrder.id === "HM59245") {
            // Keep HM59245 synced with its specific PayLater configuration and updated totals
            const hasPayLater = stored.tags?.some((t) => t.toUpperCase() === "PAYLATER") ?? false;
            const isPending = (stored.payment?.balance ?? 0) > 0;
            const isTotalMismatch = stored.total !== mockOrder.total;
            if (!hasPayLater || !isPending || isTotalMismatch) {
              parsed[index] = mockOrder;
              updated = true;
            }
          }
        }
      }

      // Backfill stageArrivedAt & update dates to today for stored orders
      const todayStr = getTodayDateString();
      for (const order of parsed) {
        if (order.date !== todayStr || !order.stageArrivedAt || Object.keys(order.stageArrivedAt).length === 0) {
          order.date = todayStr;
          order.stageArrivedAt = computeStageArrivedAt(order);
          updated = true;
        }
      }

      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ORDERS));
    }
  }
}

// ─── Read / Write ────────────────────────────────────────────────────────

/** Get all orders from the shared store. */
export function getSharedOrders(): Order[] {
  const adjustDateTime = (order: Order): Order => {
    if (order.tat) {
      const match = order.tat.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
      if (match && (match[1] || match[2])) {
        const h = parseInt(match[1] || "0", 10);
        const m = parseInt(match[2] || "0", 10);
        const actualDate = new Date(Date.now() - (h * 60 * 60 * 1000 + m * 60 * 1000));
        return {
          ...order,
          date: actualDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          time: actualDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        };
      }
    }
    return order;
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const orders = JSON.parse(raw) as Order[];
      return orders.map((o) => {
        const order = adjustDateTime(o);
        const total = getMockOrderTotal(order.id, order.items, order.payment);
        const rawItems = order.itemsList || getMockOrderItems(order.id, order.items);
        return {
          ...order,
          total,
          itemsList: resolveDynamicRouting(rawItems),
          payment: order.payment
            ? {
                ...order.payment,
                subtotal: total - (order.payment.shipping ?? 0) + (order.payment.discount ?? 0),
                total,
                balance: total - (order.payment.totalPaid ?? 0),
              }
            : {
                method: (order as any).paymentMethod || "Cash",
                total,
                totalPaid: total - ((order as any).paymentBalance ?? 0),
                cash: ((order as any).paymentMethod || "Cash") === "Cash" ? total - ((order as any).paymentBalance ?? 0) : 0,
                card: ((order as any).paymentMethod || "Cash") === "Card" ? total - ((order as any).paymentBalance ?? 0) : 0,
                subtotal: total - 10,
                discount: 0,
                shipping: 10,
                balance: ((order as any).paymentBalance ?? 0),
                shippingMethod: "Standard Delivery",
              },
        };
      });
    }
  } catch (e) {
    console.warn("[Sync] Failed to read shared orders:", e);
  }
  return MOCK_ORDERS.map((o) => {
    const order = adjustDateTime(o);
    const total = getMockOrderTotal(order.id, order.items, order.payment);
    return {
      ...order,
      total,
      itemsList: resolveDynamicRouting(getMockOrderItems(order.id, order.items)),
      payment: order.payment
        ? {
            ...order.payment,
            subtotal: total - (order.payment.shipping ?? 0) + (order.payment.discount ?? 0),
            total,
            balance: total - (order.payment.totalPaid ?? 0),
          }
        : {
            method: (order as any).paymentMethod || "Cash",
            total,
            totalPaid: total - ((order as any).paymentBalance ?? 0),
            cash: ((order as any).paymentMethod || "Cash") === "Cash" ? total - ((order as any).paymentBalance ?? 0) : 0,
            card: ((order as any).paymentMethod || "Cash") === "Card" ? total - ((order as any).paymentBalance ?? 0) : 0,
            subtotal: total - 10,
            discount: 0,
            shipping: 10,
            balance: ((order as any).paymentBalance ?? 0),
            shippingMethod: "Standard Delivery",
          },
    };
  });
}

/** Write all orders back to the shared store. */
function saveSharedOrders(orders: Order[]): void {
  const enriched = orders.map((order) => {
    const total = getMockOrderTotal(order.id, order.items, order.payment);
    return {
      ...order,
      total,
      itemsList: order.itemsList || getMockOrderItems(order.id, order.items),
      payment: order.payment
        ? {
            ...order.payment,
            subtotal: total - (order.payment.shipping ?? 0) + (order.payment.discount ?? 0),
            total,
            balance: total - (order.payment.totalPaid ?? 0),
          }
        : {
            method: (order as any).paymentMethod || "Cash",
            total,
            totalPaid: total - ((order as any).paymentBalance ?? 0),
            cash: ((order as any).paymentMethod || "Cash") === "Cash" ? total - ((order as any).paymentBalance ?? 0) : 0,
            card: ((order as any).paymentMethod || "Cash") === "Card" ? total - ((order as any).paymentBalance ?? 0) : 0,
            subtotal: total - 10,
            discount: 0,
            shipping: 10,
            balance: ((order as any).paymentBalance ?? 0),
            shippingMethod: "Standard Delivery",
          },
    };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
  localStorage.setItem(SYNC_EVENT_KEY, Date.now().toString());
}

/** Find and update a single order in the shared store. Returns the updated order or undefined. */
export function updateSharedOrder(
  orderId: string,
  updater: (order: Order) => void,
): Order | undefined {
  const orders = getSharedOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return undefined;
  const prevStatus = order.status;
  updater(order);
  if (order.status !== prevStatus) {
    if (!order.stageArrivedAt) order.stageArrivedAt = {};
    order.stageArrivedAt[order.status] = new Date().toISOString();
  }
  saveSharedOrders(orders);
  return order;
}

/** Delete an order from the shared store. */
export function deleteSharedOrder(orderId: string): void {
  const orders = getSharedOrders().filter((o) => o.id !== orderId);
  saveSharedOrders(orders);
}

/** Update or set comment on an order with admin metadata. */
export function updateOrderComment(
  orderId: string,
  commentText: string,
  adminName: string,
): Order | undefined {
  const updated = updateSharedOrder(orderId, (o) => {
    o.comment = commentText.trim();
    o.commentMeta = {
      editedBy: adminName || "Suhail (Ops Admin)",
      editedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
  broadcastChange();
  return updated;
}

/** Delete comment from an order. */
export function deleteOrderComment(orderId: string): Order | undefined {
  const updated = updateSharedOrder(orderId, (o) => {
    delete o.comment;
    delete o.commentMeta;
  });
  broadcastChange();
  return updated;
}

// ─── Cross-Tab Broadcast ─────────────────────────────────────────────────

/** Signal other tabs/apps that order data has changed. */
export function broadcastChange(): void {
  // Write a timestamp to a special key — this triggers 'storage' events in other tabs
  localStorage.setItem(SYNC_EVENT_KEY, Date.now().toString());
  // Also invalidate our own queries
  queryClientRef?.invalidateQueries({ queryKey: ["orders"] });
}

// ─── Initialization ──────────────────────────────────────────────────────

/**
 * Initialize the sync system. Call this once at app startup.
 * 
 * @param queryClient - The React Query client to invalidate on incoming changes.
 */
export function initSync(queryClient: QueryClient): void {
  if (!isDemoMode()) return;
  queryClientRef = queryClient;
  seedIfNeeded();

  // Listen for changes from other tabs / the RMO app
  window.addEventListener("storage", (event) => {
    if (event.key === SYNC_EVENT_KEY || event.key === STORAGE_KEY) {
      // Another tab/app modified order data — refetch everything
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });

  console.log("[Sync] Admin Dashboard sync initialized (demo mode)");
}

// ─── User Management Store ───────────────────────────────────────────────

const USERS_KEY = "hm_users";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "picker" | "packer" | "driver";
  phone: string;
  status: "active" | "inactive";
  password: string;
  createdAt: string;
  locationId?: string;
  assignedLocationId?: string;
}

const DEFAULT_USERS: ManagedUser[] = [
  { id: "u1", name: "Ahmed Khalil", email: "picker@rmo.qa", role: "picker", phone: "55001122", status: "active", password: "picker123", createdAt: "2026-01-15" },
  { id: "u2", name: "Sara Al-Thani", email: "packer@rmo.qa", role: "packer", phone: "55003344", status: "active", password: "packer123", createdAt: "2026-01-15" },
  { id: "u3", name: "Omar Farooq", email: "driver@rmo.qa", role: "driver", phone: "55005566", status: "active", password: "driver123", createdAt: "2026-01-15" },
  { id: "u4", name: "Nijad", email: "nijad@rmo.qa", role: "picker", phone: "55007788", status: "active", password: "picker123", createdAt: "2026-02-01" },
  { id: "u5", name: "Mashood", email: "mashood@rmo.qa", role: "packer", phone: "55009900", status: "active", password: "packer123", createdAt: "2026-02-01" },
];

function seedUsersIfNeeded(): void {
  const existing = localStorage.getItem(USERS_KEY);
  if (!existing) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  } else {
    try {
      const parsed = JSON.parse(existing);
      const filtered = parsed.filter((u: any) => u.role !== "customer_care" && u.role !== "vl_staff");
      if (filtered.length !== parsed.length) {
        localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }
}

export function getUsers(): ManagedUser[] {
  seedUsersIfNeeded();
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.filter((u: any) => u.role !== "customer_care" && u.role !== "vl_staff");
    }
  } catch {}
  return DEFAULT_USERS;
}

export function saveUsers(users: ManagedUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // Signal other tabs
  localStorage.setItem("hm_users_sync", Date.now().toString());
}

export function addUser(user: ManagedUser): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(id: string, updates: Partial<ManagedUser>): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
  }
}

export function deleteUser(id: string): void {
  const users = getUsers().filter((u) => u.id !== id);
  saveUsers(users);
}
