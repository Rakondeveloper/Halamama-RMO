/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ERPNext API Service — Order Operations                                      ║
 * ║                                                                              ║
 * ║  This is the "bridge" between your dashboard and ERPNext.                    ║
 * ║  Each function either:                                                       ║
 * ║    • Returns mock data (when VITE_USE_MOCK_DATA=true)                        ║
 * ║    • Calls the ERPNext API (when VITE_USE_MOCK_DATA=false)                   ║
 * ║                                                                              ║
 * ║  Your React components call these functions. They never need to know         ║
 * ║  whether the data comes from mock or live API — it's automatic!              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { isDemoMode } from "./config";
import { erpNextClient } from "./client";
import {
  mapErpNextToOrder,
  mapErpNextToEnrichedOrder,
  type ERPNextSalesOrder,
  type ERPNextListResponse,
  type ERPNextDocResponse,
} from "./mappers";
import {
  MOCK_ORDERS,
  getEnrichedOrder as getMockEnrichedOrder,
  type Order,
  type EnrichedOrder,
} from "@/lib/orders";
import {
  getSharedOrders,
  updateSharedOrder,
  deleteSharedOrder,
  broadcastChange,
} from "@/lib/sync";

// ─── Orders Service ──────────────────────────────────────────────────────


/**
 * Fetch all orders.
 *
 * In demo mode → returns MOCK_ORDERS
 * In live mode → calls GET /api/resource/Sales Order
 *
 * USAGE IN COMPONENTS:
 *   const orders = await ordersApi.fetchOrders();
 */
export async function fetchOrders(): Promise<Order[]> {
  // ── Demo mode: return from shared localStorage store ──
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 100));
    return getSharedOrders();
  }

  // ── Live mode: call ERPNext API ──
  const response = await erpNextClient.get<ERPNextListResponse<ERPNextSalesOrder>>(
    "/api/resource/Sales Order",
    {
      // Request specific fields from ERPNext (improves performance)
      fields: JSON.stringify([
        "name",
        "customer",
        "customer_name",
        "contact_email",
        "contact_phone",
        "transaction_date",
        "grand_total",
        "status",
        "custom_city",
        "custom_coordinator",
        "custom_driver",
        "custom_driver_status",
        "custom_picker",
        "custom_packer",
        "custom_channel",
        "custom_tat",
        "custom_bags",
        "custom_picking_status",
        "custom_packing_status",
        "custom_shopify_status",
        "custom_return_count",
        "custom_tags",
        "delivery_date",
      ]),
      // Get up to 500 orders, sorted newest first
      limit_page_length: "500",
      order_by: "creation desc",
    },
  );

  // Map each ERPNext order to our dashboard format
  return response.data.map(mapErpNextToOrder);
}

/**
 * Fetch a single order with full details (items, timeline, etc.)
 *
 * In demo mode → returns mock enriched order
 * In live mode → calls GET /api/resource/Sales Order/{orderId}
 */
export async function fetchOrderDetails(orderId: string): Promise<EnrichedOrder | undefined> {
  // ── Demo mode: read from shared store, then enrich ──
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 100));
    // Read the latest version from shared store so cross-app updates are reflected
    const orders = getSharedOrders();
    const base = orders.find((o) => o.id === orderId);
    if (!base) return undefined;
    // Temporarily patch MOCK_ORDERS so the enricher can find it
    const idx = MOCK_ORDERS.findIndex((o) => o.id === orderId);
    if (idx >= 0) Object.assign(MOCK_ORDERS[idx], base);
    return getMockEnrichedOrder(orderId);
  }

  // ── Live mode ──
  try {
    const response = await erpNextClient.get<ERPNextDocResponse<ERPNextSalesOrder>>(
      `/api/resource/Sales Order/${orderId}`,
    );
    return mapErpNextToEnrichedOrder(response.data);
  } catch {
    return undefined;
  }
}

/**
 * Update an order's status.
 *
 * USAGE:
 *   await ordersApi.updateOrderStatus("SO-00001", "Delivered");
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      o.status = newStatus as any;
    });
    broadcastChange();
    console.log(`[Sync] Updated order ${orderId} to status: ${newStatus}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    status: newStatus,
  });
}

/**
 * Assign a driver to an order.
 *
 * USAGE:
 *   await ordersApi.assignDriver("SO-00001", "driver_name");
 */
export async function assignDriver(
  orderId: string,
  driverName: string,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      o.driver = driverName || null;
      o.driverStatus = driverName ? "Assigned" : null;
      if (driverName) o.status = "Driver Accepted";
    });
    broadcastChange();
    console.log(`[Sync] Assigned driver ${driverName} to order ${orderId}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    custom_driver: driverName,
    custom_driver_status: driverName ? "Assigned" : "Unassigned",
    status: driverName ? "Driver Accepted" : "Ready to Assign",
  });
}

/**
 * Assign a picker to an order.
 */
export async function assignPicker(
  orderId: string,
  pickerName: string,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      o.picker = pickerName || null;
      if (pickerName) o.status = "Picking";
    });
    broadcastChange();
    console.log(`[Sync] Assigned picker ${pickerName} to order ${orderId}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    custom_picker: pickerName,
  });
}

/**
 * Assign a packer to an order.
 */
export async function assignPacker(
  orderId: string,
  packerName: string,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      o.packer = packerName || null;
      if (packerName) o.status = "Packing";
    });
    broadcastChange();
    console.log(`[Sync] Assigned packer ${packerName} to order ${orderId}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    custom_packer: packerName,
  });
}

/**
 * Update driver status for an order.
 */
export async function updateDriverStatus(
  orderId: string,
  driverStatus: string,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      o.driverStatus = driverStatus || null;
      // Map driver status changes to order status
      if (driverStatus === "Started") o.status = "Started";
      if (driverStatus === "Completed") o.status = "Delivered";
      if (driverStatus === "Failed") o.status = "Delivery Failed";
    });
    broadcastChange();
    console.log(`[Sync] Updated driver status for order ${orderId} to: ${driverStatus}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    custom_driver_status: driverStatus,
  });
}

/**
 * Update payment details for an order.
 */
export async function updatePaymentDetails(
  orderId: string,
  paymentMethod: string,
  balance: number,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      (o as any).paymentMethod = paymentMethod;
      (o as any).paymentBalance = balance;
    });
    broadcastChange();
    console.log(`[Sync] Updated payment details for order ${orderId}: method=${paymentMethod}, balance=${balance}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    custom_payment_method: paymentMethod,
    custom_payment_balance: balance,
  });
}

/**
 * Update notes for an order.
 */
export async function updateOrderNotes(
  orderId: string,
  notes: string,
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      o.notes = notes;
    });
    broadcastChange();
    console.log(`[Sync] Updated notes for order ${orderId} to: ${notes}`);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    custom_notes: notes,
  });
}

/** Delete an order. */
export async function deleteOrder(orderId: string): Promise<void> {
  if (isDemoMode()) {
    deleteSharedOrder(orderId);
    broadcastChange();
    console.log(`[Sync] Deleted order ${orderId}`);
    return;
  }

  await erpNextClient.delete(`/api/resource/Sales Order/${orderId}`);
}

/** Update order details. */
export async function updateOrderDetails(
  orderId: string,
  updates: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    city?: string;
    bags?: number;
    total?: number;
  }
): Promise<void> {
  if (isDemoMode()) {
    updateSharedOrder(orderId, (o) => {
      if (updates.customerName) o.customer.name = updates.customerName;
      if (updates.customerPhone) o.customer.phone = updates.customerPhone;
      if (updates.customerEmail) o.customer.email = updates.customerEmail;
      if (updates.city) o.city = updates.city;
      if (updates.bags !== undefined) o.bags = updates.bags;
      if (updates.total !== undefined) o.total = updates.total;
    });
    broadcastChange();
    console.log(`[Sync] Updated order details for ${orderId}`, updates);
    return;
  }

  await erpNextClient.put(`/api/resource/Sales Order/${orderId}`, {
    customer_name: updates.customerName,
    contact_phone: updates.customerPhone,
    contact_email: updates.customerEmail,
    custom_city: updates.city,
    custom_bags: updates.bags,
    grand_total: updates.total,
  });
}

// ─── Export as a single object for convenience ───────────────────────────
// USAGE: import { ordersApi } from "@/lib/api";
//        const orders = await ordersApi.fetchOrders();

export const ordersApi = {
  fetchOrders,
  fetchOrderDetails,
  updateOrderStatus,
  assignDriver,
  assignPicker,
  assignPacker,
  updateDriverStatus,
  updatePaymentDetails,
  updateOrderNotes,
  deleteOrder,
  updateOrderDetails,
};
