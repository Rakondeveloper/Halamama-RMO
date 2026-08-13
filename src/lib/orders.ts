import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Truck,
  Wallet,
  XCircle,
  Flag,
  ArrowLeftRight,
  RotateCcw,
} from "lucide-react";

export type OrderStatus =
  | "New"
  | "Unfulfilled"
  | "Picking"
  | "Picked"
  | "Packing"
  | "Ready to Assign"
  | "Driver Accepted"
  | "Started"
  | "Delivered"
  | "Delivery Failed"
  | "Flagged"
  | "Cancelled"
  | "Replacement"
  | "Exchange"
  | "Installation"
  | "PayLater";

export type LegacyTabId =
  | "New"
  | "Installation"
  | "Unfulfilled"
  | "Picking"
  | "Picked"
  | "Packing"
  | "Ready to Assign"
  | "In Delivery"
  | "Delivery Failed"
  | "Delivered"
  | "Flags & Exceptions"
  | "Cancelled"
  | "Returns & Replacements"
  | "Replacement"
  | "Exchange"
  | "All"
  | "PayLater";

export interface LegacyTab {
  id: LegacyTabId;
  label: string;
  color: string;
  activeColor: string;
}

export const LEGACY_TABS: LegacyTab[] = [
  { id: "New", label: "New", color: "text-sky-600 dark:text-sky-400", activeColor: "bg-sky-500" },
  { id: "All", label: "All", color: "text-foreground", activeColor: "bg-primary" },
  {
    id: "Picking",
    label: "Picking",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    activeColor: "bg-fuchsia-500",
  },
  {
    id: "Picked",
    label: "Picked",
    color: "text-violet-600 dark:text-violet-400",
    activeColor: "bg-violet-500",
  },
  {
    id: "Packing",
    label: "Packing",
    color: "text-indigo-600 dark:text-indigo-400",
    activeColor: "bg-indigo-500",
  },
  {
    id: "Ready to Assign",
    label: "Ready to Assign",
    color: "text-amber-600 dark:text-amber-400",
    activeColor: "bg-amber-500",
  },
  {
    id: "In Delivery",
    label: "In Delivery",
    color: "text-blue-600 dark:text-blue-400",
    activeColor: "bg-blue-500",
  },
  {
    id: "Delivered",
    label: "Delivered",
    color: "text-emerald-600 dark:text-emerald-400",
    activeColor: "bg-emerald-500",
  },
  {
    id: "Delivery Failed",
    label: "Delivery Failed",
    color: "text-red-600 dark:text-red-400",
    activeColor: "bg-red-500",
  },
  {
    id: "Installation",
    label: "Installation",
    color: "text-emerald-600 dark:text-emerald-400",
    activeColor: "bg-emerald-500",
  },
  {
    id: "Unfulfilled",
    label: "Unfulfilled",
    color: "text-orange-600 dark:text-orange-400",
    activeColor: "bg-orange-500",
  },
  {
    id: "Flags & Exceptions",
    label: "Flags & Exceptions",
    color: "text-red-600 dark:text-red-400",
    activeColor: "bg-red-500",
  },
  {
    id: "Cancelled",
    label: "Cancelled",
    color: "text-red-600 dark:text-red-400",
    activeColor: "bg-red-500",
  },
  {
    id: "Returns & Replacements",
    label: "Returns & Replacements",
    color: "text-pink-600 dark:text-pink-400",
    activeColor: "bg-pink-500",
  },
  {
    id: "Replacement",
    label: "Replacement",
    color: "text-indigo-600 dark:text-indigo-400",
    activeColor: "bg-indigo-500",
  },
  {
    id: "Exchange",
    label: "Exchange",
    color: "text-teal-600 dark:text-teal-400",
    activeColor: "bg-teal-500",
  },
  {
    id: "PayLater",
    label: "Pay Later",
    color: "text-purple-600 dark:text-purple-400",
    activeColor: "bg-purple-500",
  },
];

export interface Order {
  id: string;
  /** Stable customer profile id (URL segment for /customers/:customerId). */
  customerId: string;
  tat: string;
  date: string;
  time: string;
  customer: { name: string; email: string; phone: string };
  channel: "web" | "5382175" | "shopify";
  items: number;
  status: OrderStatus;
  returns?: { type: "Return"; count: number };
  /** Detailed return/replacement items for this order. */
  returnItems?: OrderReturn[];
  city: string;
  coordinator?: string;
  comment?: string;
  commentMeta?: {
    editedBy: string;
    editedAt: string;
  };
  driver: string | null;
  driverStatus?: string | null;
  picker: string | null;
  packer: string | null;
  total: number;
  shopify: "Fulfilled" | "Unfulfilled" | "Pending";
  pickingStatus?: string;
  packingStatus?: string;
  isApprovedForPicking?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  bags?: number;
  tags?: string[];
  deliveryDate?: string;
  notes?: string;
  payment?: any;
  paymentMethod?: string;
  paymentBalance?: number;
  lat?: number;
  lng?: number;
  itemsList?: OrderItemType[];
  zone?: string;
  stageArrivedAt?: Record<string, string>;
  stageTat?: Record<string, string>;
}

export type ItemFulfillmentType = "FC" | "MWH" | "VL_SUPPLIER" | "VL_HMA";

export interface OrderItemType {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  image: string;
  qty: number;
  price: number;
  fc: string;
  fcName: string;
  bin: string;
  status: "Prepared" | "Accepted" | "Allocated" | "Pending" | "Picked";
  /** Whether Operations Admin has approved this item for picking */
  isApproved?: boolean;
  /** Email of the picker assigned to / who picked this item */
  pickedBy?: string;
  /** Display name of the picker */
  pickerName?: string;
  /**
   * Fulfillment type for this item:
   * - FC: standard fulfillment center item (normal delivery flow)
   * - MWH: main warehouse item requiring installation scheduling
   * - VL_SUPPLIER: virtual/supplier item requiring installation scheduling
   * - VL_HMA: vendor location item fulfilled by HalaMama staff (VL portal)
   */
  itemType?: ItemFulfillmentType;
  /** Whether this item has been scheduled for installation */
  isScheduled?: boolean;
  /** ISO timestamp of when it was scheduled */
  scheduledAt?: string;
  /** Driver/installer assigned for the installation */
  installationDriver?: string | null;
  /** Location ID for vendor location items */
  locationId?: string;
  /** Product / Hardware Serial Number (e.g., SN-9350764006338) */
  serialNumber?: string;
  /** Individual unit serial numbers when qty > 1 */
  unitSerialNumbers?: string[];
}

export type ReturnStatus = "pending" | "picked up" | "completed";

export interface OrderReturn {
  id: string;
  itemName: string;
  sku?: string;
  type: "return" | "replacement";
  qty: number;
  status: ReturnStatus;
  source: "Shopify" | "Web";
  /** Return reason (e.g. damaged, wrong_item, near_expiry, changed_mind, other). */
  reason?: string;
  /** Admin notes entered when creating the return. */
  adminNote?: string;
  /** Driver's note when collecting the return. */
  driverNote?: string;
  /** ISO timestamp when the return was created by admin. */
  createdAt?: string;
  /** ISO timestamp when driver confirmed collection. */
  collectedAt?: string;
  /** Email of the driver who collected the return. */
  collectedBy?: string;
  /** ISO timestamp when admin confirmed warehouse receipt. */
  completedAt?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  /** The person who performed/triggered this action. */
  actor?: string;
  /** Role of the actor (picker, packer, driver, admin, system, webhook). */
  actorRole?: "picker" | "packer" | "driver" | "admin" | "system" | "webhook";
  /** Fulfillment center reference, e.g. "Fulfillment Center Hilal (F01)". */
  facility?: string;
  /** Arbitrary key-value metadata (Shopify IDs, payment info, financial data). */
  metadata?: Record<string, string>;
  /** Whether this event supports a "View Raw Details" action. */
  hasRawDetails?: boolean;
  type:
  | "added"
  | "placed"
  | "allocated"
  | "picking_started"
  | "picking_completed"
  | "packing_started"
  | "packing_completed"
  | "recalculated"
  | "updated"
  | "driver_assigned"
  | "driver_accepted"
  | "started"
  | "out_for_delivery"
  | "delivered"
  | "item_picked"
  | "item_packed"
  | "picker_assigned"
  | "packer_assigned"
  | "bags_verified"
  | "order_created"
  | "auto_fulfilled"
  | "auto_marked_paid"
  | "line_item_updated"
  | "delivery_failed"
  | "cancelled"
  | "bypassed";
}

export interface EnrichedOrder extends Order {
  zone: string;
  itemsList: OrderItemType[];
  returnsList: OrderReturn[];
  timeline: OrderTimelineEvent[];
  payment: {
    method: "Cash" | "Card" | "Split";
    totalPaid: number;
    cash: number;
    card: number;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    balance: number;
    shippingMethod: string;
  };
  notes: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  matrix: {
    fc: string;
    fcName: string;
    items: { sku: string; req: number; available: number }[];
  }[];
}

/** Build a realistic, data-driven timeline for any order based on its current status. */
function buildTimelineFor(base: Order, items?: OrderItemType[]): OrderTimelineEvent[] {
  // ── helpers ────────────────────────────────────────────────────────────────
  const addMin = (date: string, time: string, mins: number): { date: string; time: string } => {
    const [dh, dm] = time.split(":").map(Number);
    const total = dh * 60 + dm + mins;
    return {
      date,
      time: `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`,
    };
  };
  const fmt = (date: string, time: string, mins: number) => {
    const { date: d2, time: t2 } = addMin(date, time, mins);
    return { date: d2, time: t2 };
  };

  // Generate a fake Shopify-style ID from the order id
  const shopifyId = (seed: string) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    return String(Math.abs(h * 1000000 + 7363242754210));
  };

  const t0 = fmt(base.date, base.time, 0);
  const t1 = fmt(base.date, base.time, 1);
  const t2 = fmt(base.date, base.time, 2);
  const t5 = fmt(base.date, base.time, 5);
  const t8 = fmt(base.date, base.time, 8);
  const t10 = fmt(base.date, base.time, 10);
  const t12 = fmt(base.date, base.time, 12);
  const t15 = fmt(base.date, base.time, 15);
  const t20 = fmt(base.date, base.time, 20);
  const t25 = fmt(base.date, base.time, 25);
  const t30 = fmt(base.date, base.time, 30);
  const t35 = fmt(base.date, base.time, 35);
  const t45 = fmt(base.date, base.time, 45);
  const t58 = fmt(base.date, base.time, 58);
  const t65 = fmt(base.date, base.time, 65);

  const hasPicker = base.picker != null;
  const hasPacker = base.packer != null;
  const hasDriver = base.driver != null;
  const isDelivered = base.driverStatus === "Completed";
  const isActive = [
    "New",
    "Unfulfilled",
    "Picked",
    "Ready to Assign",
    "Driver Accepted",
    "Started",
  ].includes(base.status);

  // Item names for per-item events (use provided items or fallback)
  const itemNames = items?.map((i) => i.name) ?? [
    "Frida Baby NoseFrida Saline Snot Spray",
    ...(base.items > 1 ? ["SmarTrike STR3 6-in-1 Stroller-Trike (Black)"] : []),
  ];
  const itemCount = Math.max(base.items, itemNames.length);
  const fcName = "Fulfillment Center Hilal";
  const fcCode = "F01";

  const ev: OrderTimelineEvent[] = [];

  // ── 1. Order totals recalculated (initial) ─────────────────────────────────
  ev.push({
    id: "tl-recalc-1",
    title: "Order totals recalculated",
    ...t0,
    description: `Subtotal: ${(base.total - 10).toFixed(2)}, Total: ${base.total}`,
    actorRole: "system",
    metadata: { subtotal: (base.total - 10).toFixed(2), total: String(base.total) },
    type: "recalculated",
  });

  // ── 2. Order updated from Shopify (initial webhook) ────────────────────────
  ev.push({
    id: "tl-update-1",
    title: "Order updated from Shopify",
    ...t0,
    description: "Order updated via webhook",
    actorRole: "webhook",
    type: "updated",
  });

  // ── 3. Order created via webhook ───────────────────────────────────────────
  ev.push({
    id: "tl-created",
    title: "Order created/inserted via webhook",
    ...t0,
    description: "Order created/inserted via webhook",
    actorRole: "webhook",
    type: "order_created",
  });

  // ── 4. Order placed ────────────────────────────────────────────────────────
  ev.push({
    id: "tl-placed",
    title: "Order placed",
    ...t0,
    description: `Order #${base.id} was placed.`,
    actorRole: "system",
    type: "placed",
  });

  // ── 5. Auto-allocated to Fulfillment Center ────────────────────────────────
  ev.push({
    id: "tl-alloc",
    title: `Auto-allocated to ${fcName}`,
    ...t0,
    description: `${fcName} (${fcCode})\nSingle fulfillment: auto-allocated ${itemCount} items to outlet 210`,
    actorRole: "system",
    facility: `${fcName} (${fcCode})`,
    type: "allocated",
  });

  // ── 6. Order totals recalculated (post-allocation) ─────────────────────────
  ev.push({
    id: "tl-recalc-2",
    title: "Order totals recalculated",
    ...t0,
    description: `Subtotal: ${(base.total - 10).toFixed(2)}, Total: ${base.total}`,
    actorRole: "system",
    metadata: { subtotal: (base.total - 10).toFixed(2), total: String(base.total) },
    type: "recalculated",
  });

  // ── 7. Line items added (per item) ─────────────────────────────────────────
  itemNames.forEach((name, i) => {
    ev.push({
      id: `tl-added-${i}`,
      title: `Line item added: ${name}`,
      ...t0,
      description: "",
      actorRole: "system",
      hasRawDetails: true,
      type: "added",
    });
  });

  // ── 8. Order updated from Shopify (2nd sync) ──────────────────────────────
  ev.push({
    id: "tl-update-2",
    title: "Order updated from Shopify",
    ...t1,
    description: "Order updated via webhook",
    actorRole: "webhook",
    type: "updated",
  });

  // ── 9. Order totals recalculated (post-sync) ──────────────────────────────
  ev.push({
    id: "tl-recalc-3",
    title: "Order totals recalculated",
    ...t1,
    description: `Subtotal: ${(base.total - 10).toFixed(2)}, Total: ${base.total}`,
    actorRole: "system",
    metadata: { subtotal: (base.total - 10).toFixed(2), total: String(base.total) },
    type: "recalculated",
  });

  // ── 10. Picker assigned ────────────────────────────────────────────────────
  if (hasPicker) {
    const pickerName = getPickerDisplayName(base.picker);
    ev.push({
      id: "tl-picker-assigned",
      title: `Picker assigned: ${pickerName} at ${fcName}`,
      ...t5,
      description: `By: ${pickerName} · ${fcName} (${fcCode})`,
      actor: pickerName,
      actorRole: "picker",
      facility: `${fcName} (${fcCode})`,
      hasRawDetails: true,
      type: "picker_assigned",
    });

    // ── 11. Item picked (per item) ─────────────────────────────────────────
    itemNames.forEach((_, i) => {
      ev.push({
        id: `tl-item-picked-${i}`,
        title: `Item picked (qty: 1) by ${pickerName}`,
        ...fmt(base.date, base.time, 5 + i + 1),
        description: `By: ${pickerName}`,
        actor: pickerName,
        actorRole: "picker",
        hasRawDetails: true,
        type: "item_picked",
      });
    });

    // ── 12. Picking completed ──────────────────────────────────────────────
    ev.push({
      id: "tl-pick-end",
      title: `Picking completed by ${pickerName}`,
      ...t8,
      description: `By: ${pickerName}`,
      actor: pickerName,
      actorRole: "picker",
      hasRawDetails: true,
      type: "picking_completed",
    });
  } else if (isActive) {
    ev.push({
      id: "tl-pick-start",
      title: "Picking started",
      ...t5,
      description: "Picking initiated.",
      actorRole: "system",
      type: "picking_started",
    });
  }

  // ── 13. Packer assigned ────────────────────────────────────────────────────
  if (hasPacker) {
    const packerName = getUserDisplayName(base.packer);
    ev.push({
      id: "tl-packer-assigned",
      title: `Packer assigned: ${packerName} at ${fcName}`,
      ...t15,
      description: `By: ${packerName} · ${fcName} (${fcCode})`,
      actor: packerName,
      actorRole: "packer",
      facility: `${fcName} (${fcCode})`,
      type: "packer_assigned",
    });

    // ── 14. Item packed (per item) ─────────────────────────────────────────
    itemNames.forEach((_, i) => {
      ev.push({
        id: `tl-item-packed-${i}`,
        title: `Item packed (qty: 1) by ${packerName}`,
        ...fmt(base.date, base.time, 15 + i + 1),
        description: `By: ${packerName}`,
        actor: packerName,
        actorRole: "packer",
        hasRawDetails: true,
        type: "item_packed",
      });
    });

    // ── 15. Packing completed ──────────────────────────────────────────────
    const bags = base.bags ?? 1;
    ev.push({
      id: "tl-pack-end",
      title: `Packing completed — ${bags} bag(s) by ${packerName}`,
      ...t20,
      description: `By: ${packerName}`,
      actor: packerName,
      actorRole: "packer",
      hasRawDetails: true,
      metadata: { bags: String(bags) },
      type: "packing_completed",
    });
  } else if (isActive) {
    ev.push({
      id: "tl-pack-start",
      title: "Packing started",
      ...t15,
      description: "Packing initiated.",
      actorRole: "system",
      type: "packing_started",
    });
  }

  // ── 16. Driver assigned ────────────────────────────────────────────────────
  if (hasDriver) {
    const assigner = base.commentMeta?.editedBy || (base.coordinator && base.coordinator !== "-" ? base.coordinator : "suhail_halamama");
    const driverName = getUserDisplayName(base.driver);
    ev.push({
      id: "tl-drv-assign",
      title: `Driver assigned: ${driverName} by ${assigner}`,
      ...t25,
      description: `By: ${assigner} · Driver: ${driverName}\nDriver assigned internally (forced)`,
      actor: assigner,
      actorRole: "admin",
      metadata: { driver: driverName, method: "internally (forced)" },
      type: "driver_assigned",
    });

    // ── 17. Bags verified ──────────────────────────────────────────────────
    ev.push({
      id: "tl-bags-verified",
      title: `Bags verified by ${driverName}`,
      ...t35,
      description: `By: ${driverName}\nDriver verified bags match & count`,
      actor: driverName,
      actorRole: "driver",
      type: "bags_verified",
    });

    // ── 18. Driver started trip ────────────────────────────────────────────
    if (isDelivered || isActive) {
      ev.push({
        id: "tl-started",
        title: `Driver ${driverName} started trip`,
        ...t35,
        description: `By: ${driverName}`,
        actor: driverName,
        actorRole: "driver",
        type: "started",
      });
    }
  }

  // ── 19–25. Delivered + post-delivery automation ─────────────────────────────
  if (isDelivered) {
    const driverName = getUserDisplayName(base.driver);
    // Delivery event
    ev.push({
      id: "tl-delivered",
      title: `Order delivered by ${driverName}`,
      ...t58,
      description: `By: ${driverName}`,
      actor: driverName,
      actorRole: "driver",
      type: "delivered",
    });

    // Delivered (with payment details)
    ev.push({
      id: "tl-delivered-payment",
      title: `Order delivered by ${driverName}`,
      ...t58,
      description: `By: ${driverName}\nPayment: cash (Amount: ${base.total})`,
      actor: driverName,
      actorRole: "driver",
      metadata: { paymentMethod: "cash", paymentAmount: String(base.total) },
      type: "delivered",
    });

    // Auto-fulfilled on Shopify
    const fulfillId = shopifyId(base.id + "fulfill");
    ev.push({
      id: "tl-auto-fulfilled",
      title: "Order auto-fulfilled on Shopify",
      ...t58,
      description: `Auto-fulfilled on driver completion. Shopify Fulfillment ID: ${fulfillId}`,
      actorRole: "system",
      metadata: { shopifyFulfillmentId: fulfillId },
      type: "auto_fulfilled",
    });

    // Auto-marked as paid
    const txnId = shopifyId(base.id + "txn");
    ev.push({
      id: "tl-auto-paid",
      title: "Order auto-marked as paid",
      ...t58,
      description: `Auto-marked paid on driver completion. Shopify Transaction ID: ${txnId}`,
      actorRole: "system",
      metadata: { shopifyTransactionId: txnId },
      type: "auto_marked_paid",
    });

    // Order updated from Shopify (post-delivery)
    ev.push({
      id: "tl-update-3",
      title: "Order updated from Shopify",
      ...t58,
      description: "Order updated via webhook",
      actorRole: "webhook",
      type: "updated",
    });

    // Line items updated (post-delivery, per item)
    itemNames.forEach((name, i) => {
      ev.push({
        id: `tl-item-updated-${i}`,
        title: `Line item updated: ${name}`,
        ...t58,
        description: "",
        actorRole: "system",
        hasRawDetails: true,
        type: "line_item_updated",
      });
    });

    // Final recalculation
    ev.push({
      id: "tl-recalc-4",
      title: "Order totals recalculated",
      ...t58,
      description: `Subtotal: ${(base.total - 10).toFixed(2)}, Total: ${base.total}`,
      actorRole: "system",
      metadata: { subtotal: (base.total - 10).toFixed(2), total: String(base.total) },
      type: "recalculated",
    });

    // Next-day Shopify sync cycle
    ev.push({
      id: "tl-update-4",
      title: "Order updated from Shopify",
      ...t65,
      description: "Order updated via webhook",
      actorRole: "webhook",
      type: "updated",
    });
    ev.push({
      id: "tl-recalc-5",
      title: "Order totals recalculated",
      ...t65,
      description: `Subtotal: ${(base.total - 10).toFixed(2)}, Total: ${base.total}`,
      actorRole: "system",
      metadata: { subtotal: (base.total - 10).toFixed(2), total: String(base.total) },
      type: "recalculated",
    });
  }

  // Load custom timeline events from localStorage in demo mode
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem("hm_custom_timeline_events");
      if (customRaw) {
        const customEvents = JSON.parse(customRaw);
        const filtered = customEvents.filter((e: any) => e.orderId === base.id);
        ev.push(...filtered);
      }
    } catch (e) {
      console.warn("Failed to load custom timeline events", e);
    }
  }

  return ev;
}

/** Get mock order items list dynamically based on order ID, item count, order status, and picking status. */
export function getMockOrderItems(
  id: string,
  totalItems: number,
  orderStatus?: string,
  pickingStatus?: string
): OrderItemType[] {
  let itemsList: OrderItemType[] = [];

  if (id === "HM99005") {
    itemsList = [
      {
        id: "test-item-1",
        name: "Happy Hop 6-in-1 Play Center",
        sku: "9060",
        barcode: "90600000001",
        image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=100&h=100&fit=crop",
        qty: 1,
        price: 1999.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-100 / 1",
        status: "Prepared",
        itemType: "FC",
      },
      {
        id: "test-item-2",
        name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
        sku: "561KC",
        barcode: "56100000002",
        image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=100&h=100&fit=crop",
        qty: 1,
        price: 799.0,
        fc: "MWO",
        fcName: "Main Warehouse Outdoor",
        bin: "B-100 / 2",
        status: "Prepared",
        itemType: "MWH",
      },
      {
        id: "test-item-3",
        name: "Smoby Green XL Slide",
        sku: "820304",
        barcode: "82030400003",
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=100&h=100&fit=crop",
        qty: 1,
        price: 399.0,
        fc: "VS",
        fcName: "Virtual Stock",
        bin: "B-100 / 3",
        status: "Prepared",
        itemType: "VL_SUPPLIER",
      },
    ];
  } else if (id === "HM68229") {
    itemsList = [
      {
        id: "si-item-1",
        name: "Happy Hop 6-in-1 Play Center",
        sku: "9060",
        barcode: "90600000001",
        image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=100&h=100&fit=crop",
        qty: 1,
        price: 1999.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-100 / 1",
        status: "Prepared",
        itemType: "FC",
      },
      {
        id: "si-item-2",
        name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
        sku: "561KC",
        barcode: "56100000002",
        image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=100&h=100&fit=crop",
        qty: 1,
        price: 799.0,
        fc: "MWO",
        fcName: "Main Warehouse Outdoor",
        bin: "B-100 / 2",
        status: "Prepared",
        itemType: "MWH",
      },
      {
        id: "si-item-3",
        name: "Smoby Green XL Slide",
        sku: "820304",
        barcode: "82030400003",
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=100&h=100&fit=crop",
        qty: 1,
        price: 399.0,
        fc: "VS",
        fcName: "Virtual Stock",
        bin: "B-100 / 3",
        status: "Prepared",
        itemType: "VL_SUPPLIER",
      },
      {
        id: "si-item-4",
        name: "Happy Hop Double Water Slide – Deluxe",
        sku: "9029",
        barcode: "90290000004",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop",
        qty: 1,
        price: 1499.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-100 / 4",
        status: "Prepared",
      },
    ];
  } else if (id === "HM68258") {
    itemsList = [
      {
        id: "si-item-5",
        name: "Bestway H2Ogo! Leap & Play Mega Water Park",
        sku: "53427",
        barcode: "53427000005",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop",
        qty: 1,
        price: 1299.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-101 / 1",
        status: "Prepared",
      },
      {
        id: "si-item-6",
        name: "Bestway Flowclear Pool Cover (12ft)",
        sku: "58034",
        barcode: "58034000006",
        image: "https://images.unsplash.com/photo-1560090995-01b72abb4c06?w=100&h=100&fit=crop",
        qty: 1,
        price: 149.0,
        fc: "VS",
        fcName: "Virtual Stock",
        bin: "B-101 / 2",
        status: "Prepared",
      },
    ];
  } else if (id === "HM68268") {
    itemsList = [
      {
        id: "si-item-7",
        name: "Intex Prism Frame Rectangular Pool Set",
        sku: "26790",
        barcode: "26790000007",
        image: "https://images.unsplash.com/photo-1560090995-01b72abb4c06?w=100&h=100&fit=crop",
        qty: 1,
        price: 899.0,
        fc: "MWO",
        fcName: "Main Warehouse Outdoor",
        bin: "B-102 / 1",
        status: "Prepared",
      },
    ];
  } else if (id === "HM64839") {
    itemsList = [
      {
        id: "si-item-8",
        name: "Nip Soother With Hook (Blue)",
        sku: "412217",
        barcode: "41221700008",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 25.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-103 / 1",
        status: "Prepared",
      },
    ];
  } else if (id === "HM68300") {
    itemsList = [
      {
        id: "si-item-9",
        name: "HalaMama Premium Wooden Playground Set",
        sku: "HMP-WPS",
        barcode: "HMPWPS0001",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 3499.0,
        fc: "MWO",
        fcName: "Main Warehouse Outdoor",
        bin: "B-300 / 1",
        status: "Prepared",
        itemType: "MWH",
      },
    ];
  } else if (id === "HM64110") {
    itemsList = [
      {
        id: "vl-item-1",
        name: "Mima Xari Stroller (Camel)",
        sku: "MX-STR-CAM",
        barcode: "MXSTRCAM001",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 3999.0,
        fc: "VL_HMA",
        fcName: "Vendor Location 1",
        bin: "V-01",
        status: "Prepared",
        itemType: "VL_HMA",
        locationId: "loc-1",
      },
      {
        id: "vl-item-2",
        name: "Stokke Tripp Trapp High Chair (Oak)",
        sku: "ST-TTHC-OAK",
        barcode: "STTTHCOAK001",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 1199.0,
        fc: "VL_HMA",
        fcName: "Vendor Location 1",
        bin: "V-02",
        status: "Prepared",
        itemType: "VL_HMA",
        locationId: "loc-1",
      },
    ];
  } else if (id === "HM99001") {
    itemsList = [
      {
        id: "vl-item-3",
        name: "Chicco Next2Me Side Sleeping Crib",
        sku: "CC-N2M-CRIB",
        barcode: "CCN2MCRIB01",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 899.0,
        fc: "VL_HMA",
        fcName: "Vendor Location 1",
        bin: "V-03",
        status: "Prepared",
        itemType: "VL_HMA",
        locationId: "loc-1",
        pickedBy: "picker@rmo.qa",
        pickerName: "Ahmed Khalil",
      },
      {
        id: "vl-item-4",
        name: "Nuna Leaf Grow Lounger",
        sku: "NL-GROW-LNG",
        barcode: "NLGROWLNG01",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 1299.0,
        fc: "VL_HMA",
        fcName: "Vendor Location 1",
        bin: "V-04",
        status: "Prepared",
        itemType: "VL_HMA",
        locationId: "loc-1",
        pickedBy: "nijad@rmo.qa",
        pickerName: "Nijad",
      },
    ];
  } else if (id === "HM68233") {
    itemsList = [
      {
        id: "item-68233-1",
        name: "Frida Baby Saline Spray",
        sku: "NS-SPNC-1P-0200",
        barcode: "9350764006338",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 31.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-252 / 4",
        status: "Prepared",
      },
      {
        id: "item-68233-2",
        name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)",
        sku: "5021933",
        barcode: "9350764006339",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 599.0,
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        bin: "B-100 / 1",
        status: "Allocated",
      }
    ];
  } else if (id === "HM99010") {
    itemsList = [
      { id: "dummy-10-1", name: "Frida Baby Saline Spray", sku: "NS-SPNC-1P-0200", barcode: "072239306390", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 31.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-252 / 4", status: "Pending" },
      { id: "dummy-10-2", name: "Wet Wipes 3-Pack", sku: "HM-1100", barcode: "HM11000001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 29.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-101 / 2", status: "Pending" },
      { id: "dummy-10-3", name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)", sku: "5021933", barcode: "502193300001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 599.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-100 / 1", status: "Pending" },
      { id: "dummy-10-4", name: "Bestway Apx 365 Round Pool Set (12' x 30\")", sku: "561KC", barcode: "56100000002", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 799.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-300 / 5", status: "Pending" },
    ];
  } else if (id === "HM99011") {
    itemsList = [
      { id: "dummy-11-1", name: "Frida Baby Saline Spray", sku: "NS-SPNC-1P-0200", barcode: "072239306390", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 31.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-252 / 4", status: "Pending", pickedBy: "picker@rmo.qa", pickerName: "Ahmed Khalil" },
      { id: "dummy-11-2", name: "Wet Wipes 3-Pack", sku: "HM-1100", barcode: "HM11000001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 29.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-101 / 2", status: "Pending" },
      { id: "dummy-11-3", name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)", sku: "5021933", barcode: "502193300001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 599.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-100 / 1", status: "Pending" },
    ];
  } else if (id === "HM99012") {
    itemsList = [
      { id: "dummy-12-1", name: "Frida Baby Saline Spray", sku: "NS-SPNC-1P-0200", barcode: "072239306390", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 31.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-252 / 4", status: "Prepared", pickedBy: "picker@rmo.qa", pickerName: "Ahmed Khalil" },
      { id: "dummy-12-2", name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)", sku: "5021933", barcode: "502193300001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 599.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-100 / 1", status: "Pending", pickedBy: "picker@rmo.qa", pickerName: "Ahmed Khalil" },
    ];
  } else if (id === "HM99013") {
    itemsList = [
      { id: "dummy-13-1", name: "Frida Baby Saline Spray", sku: "NS-SPNC-1P-0200", barcode: "072239306390", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 31.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-252 / 4", status: "Prepared", pickedBy: "picker@rmo.qa", pickerName: "Ahmed Khalil" },
      { id: "dummy-13-2", name: "Wet Wipes 3-Pack", sku: "HM-1100", barcode: "HM11000001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 29.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-101 / 2", status: "Prepared", pickedBy: "nijad@rmo.qa", pickerName: "Nijad" },
      { id: "dummy-13-3", name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)", sku: "5021933", barcode: "502193300001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 599.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-100 / 1", status: "Pending" },
    ];
  } else if (id === "HM99014") {
    itemsList = [
      { id: "dummy-14-1", name: "Frida Baby Saline Spray", sku: "NS-SPNC-1P-0200", barcode: "072239306390", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 31.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-252 / 4", status: "Prepared", pickedBy: "picker@rmo.qa", pickerName: "Ahmed Khalil" },
      { id: "dummy-14-2", name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)", sku: "5021933", barcode: "502193300001", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop", qty: 1, price: 599.0, fc: "F01", fcName: "Fulfillment Center Hilal", bin: "B-100 / 1", status: "Prepared", pickedBy: "picker@rmo.qa", pickerName: "Ahmed Khalil" },
    ];
  } else if (id === "HM68234") {
    itemsList = [
      {
        id: "item-68234-1",
        name: "Stokke Tripp Trapp High Chair (Oak)",
        sku: "ST-TTHC-OAK",
        barcode: "STTTHCOAK001",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
        qty: 1,
        price: 1199.0,
        fc: "VL_HMA",
        fcName: "Vendor Location 1",
        bin: "V-02",
        status: "Prepared",
      }
    ];
  } else {
    const totalItemsCount = totalItems || 1;
    if (totalItemsCount === 1) {
      itemsList = [
        {
          id: "item-1",
          name: "Frida Baby NoseFrida Saline Snot Spray",
          sku: "NS-SPNC-1P-0200",
          barcode: "9350764006338",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
          qty: 1,
          price: 31.0,
          fc: "F01",
          fcName: "Fulfillment Center Hilal",
          bin: "B-252 / 4",
          status: "Prepared",
        },
      ];
    } else if (totalItemsCount === 2) {
      itemsList = [
        {
          id: "item-1",
          name: "Frida Baby NoseFrida Saline Snot Spray",
          sku: "NS-SPNC-1P-0200",
          barcode: "9350764006338",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
          qty: 1,
          price: 31.0,
          fc: "F01",
          fcName: "Fulfillment Center Hilal",
          bin: "B-252 / 4",
          status: "Prepared",
        },
        {
          id: "item-3",
          name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
          sku: "561KC",
          barcode: "561KC00001",
          image: "https://images.unsplash.com/photo-1560090995-01b72abb4c06?w=100&h=100&fit=crop",
          qty: 1,
          price: 799.0,
          fc: "MWO",
          fcName: "Main Warehouse Outdoor",
          bin: "B-102 / 2",
          status: "Prepared",
        },
      ];
    } else if (totalItemsCount === 3) {
      itemsList = [
        {
          id: "item-1",
          name: "Frida Baby NoseFrida Saline Snot Spray",
          sku: "NS-SPNC-1P-0200",
          barcode: "9350764006338",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
          qty: 1,
          price: 31.0,
          fc: "F01",
          fcName: "Fulfillment Center Hilal",
          bin: "B-252 / 4",
          status: "Prepared",
        },
        {
          id: "item-2",
          name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)",
          sku: "5021933",
          barcode: "9350764006339",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
          qty: 1,
          price: 599.0,
          fc: "F01",
          fcName: "Fulfillment Center Hilal",
          bin: "B-100 / 1",
          status: "Allocated",
        },
        {
          id: "item-3",
          name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
          sku: "561KC",
          barcode: "561KC00001",
          image: "https://images.unsplash.com/photo-1560090995-01b72abb4c06?w=100&h=100&fit=crop",
          qty: 1,
          price: 799.0,
          fc: "MWO",
          fcName: "Main Warehouse Outdoor",
          bin: "B-102 / 2",
          status: "Prepared",
        },
      ];
    } else {
      itemsList = [
        {
          id: "item-1",
          name: "Frida Baby NoseFrida Saline Snot Spray",
          sku: "NS-SPNC-1P-0200",
          barcode: "9350764006338",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
          qty: 1,
          price: 31.0,
          fc: "F01",
          fcName: "Fulfillment Center Hilal",
          bin: "B-252 / 4",
          status: "Prepared",
        },
        {
          id: "item-2",
          name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)",
          sku: "5021933",
          barcode: "9350764006339",
          image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
          qty: 1,
          price: 599.0,
          fc: "F01",
          fcName: "Fulfillment Center Hilal",
          bin: "B-100 / 1",
          status: "Allocated",
        },
        {
          id: "item-3",
          name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
          sku: "561KC",
          barcode: "561KC00001",
          image: "https://images.unsplash.com/photo-1560090995-01b72abb4c06?w=100&h=100&fit=crop",
          qty: 1,
          price: 799.0,
          fc: "MWO",
          fcName: "Main Warehouse Outdoor",
          bin: "B-102 / 2",
          status: "Prepared",
        },
        {
          id: "item-4",
          name: "Smoby Green XL Slide",
          sku: "820304",
          barcode: "82030400001",
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop",
          qty: totalItemsCount - 3,
          price: 399.0,
          fc: "VS",
          fcName: "Virtual Stock",
          bin: "B-103 / 1",
          status: "Prepared",
        },
      ];
    }
  }

  // Load cancelled items from localStorage in demo mode
  let cancelledItemIds: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("hm_cancelled_items");
      if (raw) cancelledItemIds = JSON.parse(raw);
    } catch { }
  }

  // Check if order status implies fully picked or parse pickingStatus count
  const isPostPickedStage = orderStatus && ["Picked", "Packing", "Ready to Assign", "Driver Accepted", "Started", "Delivered"].includes(orderStatus);

  let targetPickedCount = -1;
  if (isPostPickedStage) {
    targetPickedCount = itemsList.length;
  } else if (pickingStatus) {
    const match = pickingStatus.match(/^(\d+)\/(\d+)/);
    if (match) {
      targetPickedCount = parseInt(match[1], 10);
    }
  }

  return itemsList.map((item, index) => {
    const serialNumber = item.serialNumber || (item.barcode ? `SN-${item.barcode}` : `SN-${id}-${index + 1}`);
    let status = item.status;

    if (cancelledItemIds.includes(item.id)) {
      status = "Pending" as const;
    } else if (targetPickedCount >= itemsList.length) {
      status = "Prepared" as const;
    } else if (targetPickedCount >= 0) {
      status = index < targetPickedCount ? ("Prepared" as const) : ("Allocated" as const);
    }

    return {
      ...item,
      serialNumber,
      status,
    } as OrderItemType;
  });
}

/** Get mock order total dynamically based on its items and payment information. */
export function getMockOrderTotal(id: string, totalItems: number, payment?: any, orderStatus?: string, pickingStatus?: string): number {
  const itemsList = getMockOrderItems(id, totalItems, orderStatus, pickingStatus);
  const subtotal = itemsList.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = payment?.discount ?? 0;
  const shipping = payment?.shipping ?? 0;
  return subtotal + shipping - discount;
}

/** Mock enriched order for the details page */
export function getEnrichedOrder(id: string): EnrichedOrder | undefined {
  const baseOrder = MOCK_ORDERS.find((o) => o.id === id);
  if (!baseOrder) return undefined;

  const itemsList = baseOrder.itemsList && baseOrder.itemsList.length > 0
    ? baseOrder.itemsList
    : getMockOrderItems(id, baseOrder.items, baseOrder.status, baseOrder.pickingStatus);
  const calculatedTotal = getMockOrderTotal(id, baseOrder.items, baseOrder.payment, baseOrder.status, baseOrder.pickingStatus);

  return {
    ...baseOrder,
    zone: "No Zone",
    itemsList,
    returnsList: baseOrder.returnItems && baseOrder.returnItems.length > 0
      ? baseOrder.returnItems
      : [],
    timeline: buildTimelineFor(baseOrder, itemsList),
    payment: baseOrder.payment ? {
      ...baseOrder.payment,
      subtotal: calculatedTotal - (baseOrder.payment.shipping ?? 0) + (baseOrder.payment.discount ?? 0),
      total: calculatedTotal,
      balance: (baseOrder as any).paymentBalance !== undefined
        ? (baseOrder as any).paymentBalance
        : (calculatedTotal - (baseOrder.payment.totalPaid ?? 0)),
      totalPaid: calculatedTotal - ((baseOrder as any).paymentBalance !== undefined
        ? (baseOrder as any).paymentBalance
        : (baseOrder.payment.balance ?? 0)),
    } : {
      method: ((baseOrder as any).paymentMethod as any) || "Cash",
      total: calculatedTotal,
      totalPaid: calculatedTotal - ((baseOrder as any).paymentBalance ?? 0),
      cash: ((baseOrder as any).paymentMethod || "Cash") === "Cash" ? calculatedTotal - ((baseOrder as any).paymentBalance ?? 0) : 0,
      card: ((baseOrder as any).paymentMethod || "Cash") === "Card" ? calculatedTotal - ((baseOrder as any).paymentBalance ?? 0) : 0,
      subtotal: calculatedTotal - 10,
      discount: 0,
      shipping: 10,
      balance: ((baseOrder as any).paymentBalance ?? 0),
      shippingMethod: "Standard Delivery",
    },
    notes: baseOrder.notes || "Please leave at the door if no one answers.",
    shippingAddress: id === "HM99005" ? {
      line1: "Al Waab St",
      line2: "Doha",
      city: "Qatar",
      country: "Qatar",
      lat: 25.2638,
      lng: 51.4822,
    } : {
      line1: "Al rayyan al azizya, Home number 20",
      line2: "Al azizya",
      city: "Qatar",
      country: "Qatar",
      lat: 25.24127,
      lng: 51.444699,
    },
    matrix: [
      {
        fc: "F01",
        fcName: "Fulfillment Center Hilal",
        items: itemsList.map(item => ({
          sku: item.sku,
          req: item.qty,
          available: item.fc === "F01" ? item.qty : 0,
        })),
      },
      {
        fc: "MWO",
        fcName: "Main Warehouse Outdoor",
        items: itemsList.map(item => ({
          sku: item.sku,
          req: item.qty,
          available: item.fc === "MWO" ? item.qty : (item.sku === "561KC" || item.sku === "26790" ? 10 : 0),
        })),
      },
      {
        fc: "VS",
        fcName: "Virtual Stock",
        items: itemsList.map(item => ({
          sku: item.sku,
          req: item.qty,
          available: item.fc === "VS" ? item.qty : (item.sku === "820304" || item.sku === "58034" ? 15 : 0),
        })),
      },
      {
        fc: "F02",
        fcName: "Main Warehouse - Safety Stock",
        items: itemsList.map(item => ({
          sku: item.sku,
          req: item.qty,
          available: item.fc === "F02" ? item.qty : 5,
        })),
      },
    ],
  };
}

export type SegmentId = "all" | "active" | "delivered" | "issues";

export type IssueSubFilter = "Delivery Failed" | "Returns" | "Cancelled" | null;

export const ACTIVE_STATUSES: OrderStatus[] = [
  "New",
  "Unfulfilled",
  "Picked",
  "Ready to Assign",
  "Driver Accepted",
  "Started",
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "HM99010",
    customerId: "cust-99010",
    tat: "00h 10m",
    date: getTodayDateString(),
    time: "14:15",
    customer: { name: "Mariam Al-Kabi", email: "mariam.kabi@example.com", phone: "33881122" },
    channel: "shopify",
    items: 4,
    status: "New",
    city: "Doha",
    coordinator: "-",
    driver: null,
    picker: null,
    packer: null,
    total: 1458,
    shopify: "Unfulfilled",
    pickingStatus: "0/4 Picked",
    packingStatus: "0/4 Packed",
    bags: 0,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM99011",
    customerId: "cust-99011",
    tat: "00h 15m",
    date: getTodayDateString(),
    time: "14:30",
    customer: { name: "Tariq Al-Mansoori", email: "tariq.mansoori@example.com", phone: "55441199" },
    channel: "shopify",
    items: 3,
    status: "Picking",
    city: "West Bay",
    coordinator: "-",
    driver: null,
    picker: "picker@rmo.qa",
    packer: null,
    total: 659,
    shopify: "Unfulfilled",
    pickingStatus: "0/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
    lat: 25.3286,
    lng: 51.5310,
  },
  {
    id: "HM99012",
    customerId: "cust-99012",
    tat: "00h 20m",
    date: getTodayDateString(),
    time: "14:45",
    customer: { name: "Hind Al-Sulaiti", email: "hind.sulaiti@example.com", phone: "66770011" },
    channel: "shopify",
    items: 2,
    status: "Picking",
    city: "The Pearl",
    coordinator: "-",
    driver: null,
    picker: "picker@rmo.qa",
    packer: null,
    total: 630,
    shopify: "Unfulfilled",
    pickingStatus: "1/2 Picked",
    packingStatus: "0/2 Packed",
    bags: 0,
    lat: 25.3713,
    lng: 51.5476,
  },
  {
    id: "HM99013",
    customerId: "cust-99013",
    tat: "00h 25m",
    date: getTodayDateString(),
    time: "15:00",
    customer: { name: "Rashid Al-Naimi", email: "rashid.naimi@example.com", phone: "33992288" },
    channel: "shopify",
    items: 3,
    status: "Picking",
    city: "Lusail",
    coordinator: "-",
    driver: null,
    picker: "Ahmed Khalil, Nijad",
    packer: null,
    total: 659,
    shopify: "Unfulfilled",
    pickingStatus: "2/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
    lat: 25.4182,
    lng: 51.5218,
  },
  {
    id: "HM99014",
    customerId: "cust-99014",
    tat: "00h 30m",
    date: getTodayDateString(),
    time: "15:15",
    customer: { name: "Reem Al-Thani", email: "reem.thani@example.com", phone: "55113344" },
    channel: "shopify",
    items: 2,
    status: "Picked",
    city: "Al Waab",
    coordinator: "-",
    driver: null,
    picker: "picker@rmo.qa",
    packer: null,
    total: 630,
    shopify: "Unfulfilled",
    pickingStatus: "2/2 Picked",
    packingStatus: "0/2 Packed",
    bags: 0,
    lat: 25.2638,
    lng: 51.4822,
  },
  {
    id: "HM68233",
    customerId: "cust-68233",
    tat: "00h 10m",
    date: getTodayDateString(),
    time: "14:30",
    customer: { name: "Ahmed Al-Malki", email: "ahmed.malki@example.com", phone: "55998877" },
    channel: "shopify",
    items: 2,
    status: "Picking",
    city: "Doha",
    coordinator: "-",
    driver: null,
    picker: "picker@rmo.qa",
    packer: null,
    total: 630,
    shopify: "Unfulfilled",
    pickingStatus: "1/2 Picked",
    packingStatus: "0/2 Packed",
    bags: 0,
    lat: 25.2854,
    lng: 51.5310,
    payment: {
      subtotal: 630,
      discount: 0,
      shipping: 0,
      shippingMethod: "Standard Delivery",
      total: 630,
      balance: 630,
      method: "Credit Card",
      totalPaid: 0,
      cash: 0,
      card: 0,
    },
  },
  {
    id: "HM68234",
    customerId: "cust-68234",
    tat: "00h 15m",
    date: getTodayDateString(),
    time: "15:00",
    customer: { name: "Sara Al-Khuwaili", email: "sara.khuwaili@example.com", phone: "33445577" },
    channel: "web",
    items: 1,
    status: "Packing",
    city: "Doha",
    coordinator: "-",
    driver: null,
    picker: "picker@rmo.qa",
    packer: "packer@rmo.qa",
    total: 1199,
    shopify: "Unfulfilled",
    pickingStatus: "1/1 Picked",
    packingStatus: "0/1 Packed",
    bags: 0,
    lat: 25.3286,
    lng: 51.5310,
    payment: {
      subtotal: 1199,
      discount: 0,
      shipping: 0,
      shippingMethod: "Standard Delivery",
      total: 1199,
      balance: 1199,
      method: "Cash on Delivery",
      totalPaid: 0,
      cash: 0,
      card: 0,
    },
  },
  {
    id: "HM99005",
    customerId: "cust-99005",
    tat: "00h 01m",
    date: getTodayDateString(),
    time: "10:55",
    customer: { name: "Khalid Al-Nuaimi", email: "khalid.nuaimi@example.com", phone: "55776688" },
    channel: "shopify",
    items: 3,
    status: "New",
    city: "Doha",
    coordinator: "-",
    driver: null,
    picker: null,
    packer: null,
    total: 3197,
    shopify: "Unfulfilled",
    pickingStatus: "0/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
    lat: 25.2638,
    lng: 51.4822,
    payment: {
      subtotal: 3197,
      discount: 0,
      shipping: 0,
      shippingMethod: "Standard Delivery",
      total: 3197,
      balance: 3197,
      method: "Cash on Delivery",
      totalPaid: 0,
      cash: 0,
      card: 0,
    },
  },
  {
    id: "HM59238",
    customerId: "cust-59238",
    tat: "01h 30m",
    date: getTodayDateString(),
    time: "11:34",
    customer: { name: "test test", email: "nandu@halamama.com", phone: "77532802" },
    channel: "web",
    items: 0,
    status: "Cancelled",
    returns: { type: "Return", count: 1 },
    returnItems: [
      {
        id: "ret-HM59238-1",
        itemName: "Beurer Sugar Machine With 50 Strips",
        sku: "BEU-SM-050",
        type: "return",
        qty: 1,
        status: "completed",
        source: "Web",
        reason: "damaged",
        adminNote: "Customer reported device not powering on.",
        createdAt: "2026-04-16T18:40:00Z",
        collectedAt: "2026-04-17T10:20:00Z",
        collectedBy: "driver1",
        completedAt: "2026-04-17T14:00:00Z",
      },
    ],
    city: "Doha",
    coordinator: "-",
    driver: "driver1",
    driverStatus: "Completed",
    picker: null,
    packer: null,
    total: 10,
    shopify: "Fulfilled",
    pickingStatus: "0/0 Picked",
    packingStatus: "0/0 Packed",
    bags: 0,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM59239",
    customerId: "cust-59239",
    tat: "02h 10m",
    date: getTodayDateString(),
    time: "10:35",
    customer: { name: "Sara Alsooj", email: "bent-alsooj@hotmail.com", phone: "55339494" },
    channel: "5382175",
    items: 2,
    status: "Delivered",
    returns: { type: "Return", count: 1 },
    returnItems: [
      {
        id: "ret-HM59239-1",
        itemName: "Philips Avent Natural Bottle 260ml",
        sku: "PA-NB-260",
        type: "return",
        qty: 1,
        status: "picked up",
        source: "Web",
        reason: "damaged",
        adminNote: "Bottle had visible crack on arrival.",
        createdAt: "2026-04-16T19:00:00Z",
        collectedAt: "2026-04-17T09:15:00Z",
        collectedBy: "irshad",
      },
    ],
    city: "Zone 50",
    coordinator: "-",
    driver: "irshad",
    driverStatus: "Completed",
    picker: "picker1",
    packer: "packer1",
    total: 178,
    shopify: "Fulfilled",
    pickingStatus: "2/2 Picked",
    packingStatus: "2/2 Packed",
    bags: 1,
    lat: 25.2279,
    lng: 51.4941,
  },
  {
    id: "HM59245",
    customerId: "cust-59245",
    tat: "02h 15m",
    date: getTodayDateString(),
    time: "11:00",
    customer: { name: "Fatima Al-Thani", email: "fatima.thani@gmail.com", phone: "33442211" },
    channel: "shopify",
    items: 3,
    status: "New",
    city: "West Bay",
    coordinator: "-",
    driver: null,
    picker: null,
    packer: null,
    total: 1429,
    shopify: "Pending",
    pickingStatus: "0/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
    tags: ["PAYLATER", "PAYMENTLINKSENT"],
    notes: "Customer chose Pay Later. Payment link sent: https://halamama.myshopify.com/checkouts/pay/c1b2c3d4e5f6",
    payment: {
      subtotal: 1429,
      discount: 0,
      shipping: 0,
      shippingMethod: "Standard Delivery",
      total: 1429,
      balance: 1429,
      method: "Shopify PayLater",
      totalPaid: 0,
      cash: 0,
      card: 0,
    },
    lat: 25.3286,
    lng: 51.5310,
  },
  {
    id: "HM64110",
    customerId: "cust-64110",
    tat: "00h 28m",
    date: getTodayDateString(),
    time: "10:15",
    customer: { name: "Dana Al-Thani", email: "dana.thani@gmail.com", phone: "55223344" },
    channel: "shopify",
    items: 2,
    status: "New",
    city: "West Bay",
    coordinator: "-",
    driver: null,
    picker: null,
    packer: null,
    total: 630,
    shopify: "Unfulfilled",
    pickingStatus: "0/2 Picked",
    packingStatus: "0/2 Packed",
    bags: 0,
    lat: 25.3286,
    lng: 51.5310,
  },
  {
    id: "HM64112",
    customerId: "cust-64112",
    tat: "00h 58m",
    date: getTodayDateString(),
    time: "09:45",
    customer: { name: "Zoe Henderson", email: "zoe.h@outlook.com", phone: "33445566" },
    channel: "web",
    items: 4,
    status: "New",
    city: "The Pearl",
    coordinator: "Omar",
    driver: null,
    picker: "noushad",
    packer: null,
    total: 740,
    shopify: "Unfulfilled",
    pickingStatus: "2/4 Picked",
    packingStatus: "0/4 Packed",
    bags: 0,
    lat: 25.3713,
    lng: 51.5476,
  },
  {
    id: "HM64116",
    customerId: "cust-64116",
    tat: "01h 31m",
    date: getTodayDateString(),
    time: "09:12",
    customer: { name: "Liam Gallagher", email: "liam.g@oasis.com", phone: "55009988" },
    channel: "web",
    items: 3,
    status: "Picked",
    city: "Lusail",
    coordinator: "Rania",
    driver: null,
    picker: "rahul",
    packer: null,
    total: 320,
    shopify: "Pending",
    pickingStatus: "3/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
    lat: 25.4182,
    lng: 51.5218,
  },
  {
    id: "HM64118",
    customerId: "cust-64118",
    tat: "02h 03m",
    date: getTodayDateString(),
    time: "08:40",
    customer: { name: "Amira Haddad", email: "amira.h@gmail.com", phone: "66778899" },
    channel: "shopify",
    items: 5,
    status: "Picked",
    city: "Doha",
    coordinator: "Omar",
    driver: null,
    picker: "adhil",
    packer: "mashood",
    total: 1250,
    shopify: "Pending",
    pickingStatus: "5/5 Picked",
    packingStatus: "3/5 Packed",
    bags: 1,
    lat: 25.2764,
    lng: 51.5385,
  },
  {
    id: "HM60104",
    customerId: "cust-60104",
    tat: "03h 22m",
    date: getTodayDateString(),
    time: "12:41",
    customer: { name: "Hessa Al-Jaber", email: "hessa.jaber@gmail.com", phone: "55330012" },
    channel: "shopify",
    items: 4,
    status: "Driver Accepted",
    city: "Lusail",
    coordinator: "Rania",
    driver: "irshad",
    driverStatus: "Accepted",
    picker: "noushad",
    packer: "packer1",
    total: 760,
    shopify: "Pending",
    pickingStatus: "4/4 Picked",
    packingStatus: "4/4 Packed",
    bags: 2,
    lat: 25.4182,
    lng: 51.5218,
  },
  {
    id: "HM60105",
    customerId: "cust-60105",
    tat: "04h 03m",
    date: getTodayDateString(),
    time: "13:12",
    customer: { name: "Rashed Nasser", email: "rashed.nasser@gmail.com", phone: "55881234" },
    channel: "web",
    items: 5,
    status: "Started",
    city: "Education City",
    coordinator: "Omar",
    driver: "farshad",
    driverStatus: "Started",
    picker: "adhil",
    packer: "mashood",
    total: 925,
    shopify: "Pending",
    pickingStatus: "5/5 Picked",
    packingStatus: "5/5 Packed",
    bags: 3,
    lat: 25.3183,
    lng: 51.4358,
  },
  {
    id: "HM60106",
    customerId: "cust-60106",
    tat: "05h 37m",
    date: getTodayDateString(),
    time: "13:48",
    customer: { name: "Dana Ibrahim", email: "dana.ibrahim@gmail.com", phone: "55773391" },
    channel: "web",
    items: 1,
    status: "Delivery Failed",
    city: "Al Rayyan",
    coordinator: "Rania",
    driver: "nassim",
    driverStatus: "Failed",
    picker: "rahul",
    packer: "packer1",
    total: 145,
    shopify: "Pending",
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
    lat: 25.2917,
    lng: 51.4244,
  },
  {
    id: "HM60107",
    customerId: "cust-60107",
    tat: "06h 10m",
    date: getTodayDateString(),
    time: "14:26",
    customer: { name: "Lina Qassim", email: "lina.qassim@gmail.com", phone: "55990031" },
    channel: "shopify",
    items: 2,
    status: "Replacement",
    returns: { type: "Return", count: 1 },
    returnItems: [
      {
        id: "ret-HM60107-1",
        itemName: "Nip 2in1 Soother Box Sterilizer and Hygienic Case (Blue)",
        sku: "NIP-STZ-001",
        type: "return",
        qty: 1,
        status: "pending",
        source: "Shopify",
        reason: "wrong",
        adminNote: "Customer received wrong colour variant.",
        createdAt: "2026-05-13T14:30:00Z",
      },
    ],
    city: "Muaither",
    coordinator: "Omar",
    driver: "irshad",
    driverStatus: "Accepted",
    picker: "noushad",
    packer: "mashood",
    total: 230,
    shopify: "Pending",
    pickingStatus: "2/2 Picked",
    packingStatus: "2/2 Packed",
    bags: 1,
    lat: 25.2682,
    lng: 51.4069,
  },
  {
    id: "HM60108",
    customerId: "cust-60108",
    tat: "07h 25m",
    date: getTodayDateString(),
    time: "15:04",
    customer: { name: "Othman Kareem", email: "othman.kareem@gmail.com", phone: "55447766" },
    channel: "web",
    items: 3,
    status: "Exchange",
    returns: { type: "Return", count: 2 },
    returnItems: [
      {
        id: "ret-HM60108-1",
        itemName: "Chicco Baby Carrier EasyFit (Grey)",
        sku: "CHC-BC-EF-GR",
        type: "replacement",
        qty: 1,
        status: "picked up",
        source: "Web",
        reason: "wrong",
        adminNote: "Customer ordered blue, received grey. Exchange approved.",
        createdAt: "2026-05-13T15:10:00Z",
        collectedAt: "2026-05-14T11:00:00Z",
        collectedBy: "farshad",
      },
      {
        id: "ret-HM60108-2",
        itemName: "Tommee Tippee Closer to Nature Bottle 150ml",
        sku: "TT-CTN-150",
        type: "return",
        qty: 2,
        status: "pending",
        source: "Web",
        reason: "damaged",
        adminNote: "Bottles leaking from cap seal.",
        createdAt: "2026-05-14T09:00:00Z",
      },
    ],
    city: "Old Airport",
    coordinator: "Rania",
    driver: "farshad",
    driverStatus: "Accepted",
    picker: "rahul",
    packer: "packer1",
    total: 388,
    shopify: "Pending",
    pickingStatus: "3/3 Picked",
    packingStatus: "3/3 Packed",
    bags: 1,
    lat: 25.2494,
    lng: 51.5492,
  },
  {
    id: "HM63850",
    customerId: "cust-63850",
    tat: "02h 34m",
    date: getTodayDateString(),
    time: "10:15",
    customer: { name: "Noora Almannai", email: "n.a.y.1@hotmail.com", phone: "+97466111881" },
    channel: "web" as const,
    items: 1,
    status: "Installation" as const,
    city: "Doha",
    coordinator: "-",
    driver: "mwd_nishad",
    driverStatus: "Completed",
    picker: "rahul",
    packer: "packer1",
    total: 1749,
    shopify: "Fulfilled" as const,
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM68300",
    customerId: "cust-68300",
    tat: "01h 00m",
    date: getTodayDateString(),
    time: "12:30",
    customer: { name: "Fatima Al-Kuwari", email: "fatima.kuwari@example.com", phone: "55889900" },
    channel: "shopify" as const,
    items: 1,
    status: "Ready to Assign" as const,
    city: "Doha",
    coordinator: "-",
    driver: null,
    driverStatus: null,
    picker: "rahul",
    packer: "packer1",
    total: 3499,
    shopify: "Pending" as const,
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM68229",
    customerId: "cust-68229",
    tat: "01h 15m",
    date: getTodayDateString(),
    time: "14:10",
    customer: { name: "Sara Al Sulaiti", email: "sara.sulaiti@example.com", phone: "55112233" },
    channel: "web" as const,
    items: 4,
    status: "Ready to Assign" as const,
    city: "Doha",
    coordinator: "-",
    driver: null,
    driverStatus: null,
    picker: "rahul",
    packer: "packer1",
    total: 4696,
    shopify: "Pending" as const,
    pickingStatus: "4/4 Picked",
    packingStatus: "4/4 Packed",
    bags: 2,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM68258",
    customerId: "cust-68258",
    tat: "00h 40m",
    date: getTodayDateString(),
    time: "15:20",
    customer: { name: "Mouza Al Derham", email: "mouza.derham@example.com", phone: "55667788" },
    channel: "web" as const,
    items: 2,
    status: "Ready to Assign" as const,
    city: "Doha",
    coordinator: "-",
    driver: null,
    driverStatus: null,
    picker: "noushad",
    packer: "packer1",
    total: 1448,
    shopify: "Pending" as const,
    pickingStatus: "2/2 Picked",
    packingStatus: "2/2 Packed",
    bags: 1,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM68268",
    customerId: "cust-68268",
    tat: "02h 05m",
    date: getTodayDateString(),
    time: "09:30",
    customer: { name: "aisha alnaemi", email: "aisha.naemi@example.com", phone: "55990011" },
    channel: "shopify" as const,
    items: 1,
    status: "Ready to Assign" as const,
    city: "Doha",
    coordinator: "-",
    driver: null,
    driverStatus: null,
    picker: "adhil",
    packer: "mashood",
    total: 899,
    shopify: "Pending" as const,
    packingStatus: "1/1 Packed",
    bags: 1,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM64839",
    customerId: "cust-64839",
    tat: "03h 12m",
    date: getTodayDateString(),
    time: "11:15",
    customer: { name: "test test", email: "test.test@example.com", phone: "77532802" },
    channel: "web" as const,
    items: 1,
    status: "Driver Accepted" as const,
    city: "Doha",
    coordinator: "-",
    driver: "driver1",
    driverStatus: "Accepted",
    picker: "rahul",
    packer: "packer1",
    total: 25,
    shopify: "Pending" as const,
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM99001",
    customerId: "cust-99001",
    tat: "01h 05m",
    date: getTodayDateString(),
    time: "14:00",
    customer: { name: "Salem Al-Marri", email: "salem.marri@example.com", phone: "33224455" },
    channel: "shopify" as const,
    items: 2,
    status: "Picking" as const,
    city: "Doha",
    coordinator: "-",
    driver: null,
    picker: "picker@rmo.qa, nijad@rmo.qa",
    packer: null,
    total: 480,
    shopify: "Unfulfilled" as const,
    pickingStatus: "0/2 Picked",
    packingStatus: "0/2 Packed",
    bags: 0,
    lat: 25.2854,
    lng: 51.5310,
  },
  {
    id: "HM99003",
    customerId: "cust-99003",
    tat: "04h 15m",
    date: getTodayDateString(),
    time: "11:20",
    customer: { name: "Mohammed Al-Sada", email: "m.sada@example.com", phone: "66554433" },
    channel: "web" as const,
    items: 2,
    status: "Ready to Assign" as const,
    city: "Lusail",
    coordinator: "Omar",
    driver: null,
    picker: "rahul",
    packer: "packer1",
    total: 320,
    shopify: "Pending" as const,
    pickingStatus: "2/2 Picked",
    packingStatus: "2/2 Packed",
    bags: 1,
    lat: 25.4182,
    lng: 51.5218,
  },
]

export function isUnpaidPayLaterOrder(order: { tags?: string[]; payment?: { balance: number } }): boolean {
  const hasTag = order.tags?.some((t) => t.toUpperCase() === "PAYLATER") ?? false;
  const isPending = (order.payment?.balance ?? 0) > 0;
  return hasTag && isPending;
}

export const ORDER_STATS = [
  {
    label: "Picking",
    value: MOCK_ORDERS.filter(
      (order) => order.status === "Picked" && !isUnpaidPayLaterOrder(order),
    ).length.toLocaleString(),
    icon: Package,
    tone: "violet" as const,
  },
  {
    label: "Packing",
    value: MOCK_ORDERS.filter(
      (order) => order.status === "Ready to Assign" && !isUnpaidPayLaterOrder(order),
    ).length.toLocaleString(),
    icon: PackageCheck,
    tone: "primary" as const,
  },
  {
    label: "Delivered",
    value: MOCK_ORDERS.filter(
      (order) => order.status === "Delivered" && !isUnpaidPayLaterOrder(order),
    ).length.toLocaleString(),
    icon: Truck,
    tone: "primary" as const,
  },
  {
    label: "Revenue",
    value: `QAR ${Math.round(MOCK_ORDERS.filter(o => !isUnpaidPayLaterOrder(o)).reduce((sum, order) => sum + order.total, 0) / 1000)}K`,
    icon: Wallet,
    tone: "success" as const,
  },
];

export const statusIcon: Record<OrderStatus, LucideIcon> = {
  New: Sparkles,
  Unfulfilled: Clock3,
  Picking: PackageCheck,
  Picked: PackageCheck,
  Packing: Package,
  "Ready to Assign": Truck,
  "Driver Accepted": Truck,
  Started: RefreshCw,
  Delivered: CheckCircle2,
  "Delivery Failed": XCircle,
  Flagged: Flag,
  Cancelled: XCircle,
  Replacement: ArrowLeftRight,
  Exchange: RotateCcw,
  Installation: Clock3,
  PayLater: Clock3,
};

/** Tailwind classes for the status indicator dot */
export function statusDotClass(status: OrderStatus): string {
  switch (status) {
    case "Delivered":
      return "bg-emerald-500";
    case "Delivery Failed":
    case "Cancelled":
      return "bg-destructive";
    case "New":
      return "bg-sky-500";
    case "Unfulfilled":
      return "bg-muted-foreground";
    case "Picking":
      return "bg-fuchsia-500";
    case "Picked":
      return "bg-violet-500";
    case "Packing":
      return "bg-indigo-500";
    case "Ready to Assign":
      return "bg-amber-500";
    case "Driver Accepted":
      return "bg-blue-500";
    case "Started":
      return "bg-orange-500";
    case "Flagged":
      return "bg-rose-500";
    case "Replacement":
      return "bg-indigo-500";
    case "Exchange":
      return "bg-teal-500";
    case "Installation":
      return "bg-emerald-500";
    case "PayLater":
      return "bg-purple-500";
    default:
      return "bg-muted-foreground";
  }
}

export function matchesSearch(order: Order, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const blob = [
    order.id,
    order.customerId,
    order.customer.name,
    order.customer.email,
    order.customer.phone,
    order.city,
    order.status,
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}

export function matchesLegacyTab(order: Order, tab: LegacyTabId): boolean {
  const isPayLater = isUnpaidPayLaterOrder(order);
  if (isPayLater) {
    return tab === "PayLater";
  } else {
    if (tab === "PayLater") return false;
  }

  if (tab === "All") return true;
  if (tab === "Unfulfilled") return order.status !== "Delivered";
  if (tab === "Installation") return order.status === "Installation";
  if (tab === "Returns & Replacements")
    return Boolean(order.returns) || order.status === "Replacement" || order.status === "Exchange";
  if (tab === "Flags & Exceptions") {
    if (order.status === "Flagged" || order.status === "Delivery Failed") return true;
    const m = order.tat.match(/(\d+)h/);
    if (m && parseInt(m[1], 10) > 24) return true;
    return false;
  }
  if (tab === "Replacement") return order.status === "Replacement";
  if (tab === "Exchange") return order.status === "Exchange";
  if (tab === "In Delivery") return order.status === "Driver Accepted" || order.status === "Started";
  return order.status === tab;
}

export function countForLegacyTab(orders: Order[], tab: LegacyTabId): number {
  return orders.filter((o) => matchesLegacyTab(o, tab)).length;
}

export function matchesSegment(
  order: Order,
  segment: SegmentId,
  activeSub: OrderStatus | null,
  issueSub: IssueSubFilter,
): boolean {
  if (segment === "all") return true;
  if (segment === "delivered") return order.status === "Delivered";
  if (segment === "active") {
    if (!activeSub) return ACTIVE_STATUSES.includes(order.status);
    return order.status === activeSub;
  }
  if (segment === "issues") {
    if (issueSub === "Returns") return Boolean(order.returns);
    if (issueSub === "Cancelled") return order.status === "Cancelled";
    if (issueSub === "Delivery Failed") return order.status === "Delivery Failed";
    return (
      order.status === "Delivery Failed" || order.status === "Cancelled" || Boolean(order.returns)
    );
  }
  return true;
}

export function countOrdersForSegment(orders: Order[], segment: SegmentId): number {
  return orders.filter((o) => matchesSegment(o, segment, null, null)).length;
}

export function countActiveSub(orders: Order[], status: OrderStatus): number {
  return orders.filter((o) => ACTIVE_STATUSES.includes(o.status) && o.status === status).length;
}

export function countIssueSub(orders: Order[], sub: Exclude<IssueSubFilter, null>): number {
  if (sub === "Returns") return orders.filter((o) => Boolean(o.returns)).length;
  if (sub === "Cancelled") return orders.filter((o) => o.status === "Cancelled").length;
  return orders.filter((o) => o.status === "Delivery Failed").length;
}

/** Parse TAT string to hours for color coding */
export function parseTatHours(tat: string): number {
  const hMatch = tat.match(/(\d+)h/);
  const mMatch = tat.match(/(\d+)m/);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
  return hours + minutes / 60;
}

/** Get TAT color class based on hours elapsed */
export function tatColorClass(tat: string): string {
  if (tat === "—") return "text-muted-foreground";
  const hours = parseTatHours(tat);
  if (hours <= 2) return "text-emerald-600 dark:text-emerald-400";
  if (hours <= 12) return "text-amber-600 dark:text-amber-400";
  if (hours <= 24) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

/** Get today's formatted date string e.g. "Jul 22" */
export function getTodayDateString(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Format ISO timestamp string or epoch ms to TAT string like "1h 30m" or "50m" */
export function formatTatFromTimestamp(timestampISO: string | number): string {
  const date = new Date(timestampISO);
  if (isNaN(date.getTime())) return "0m";
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/** Format duration between two timestamps as TAT string like "2h 10m" or "50m" */
export function formatTatBetweenTimestamps(
  startTimestampISO: string | number,
  endTimestampISO: string | number
): string {
  const start = new Date(startTimestampISO).getTime();
  const end = new Date(endTimestampISO).getTime();
  if (isNaN(start) || isNaN(end)) return "0m";
  const diffMs = Math.max(0, end - start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * The ordered lifecycle stages for an order.
 * Used to determine whether an order has "reached" a given stage yet.
 */
const STAGE_ORDER: string[] = [
  "New",
  "Picking",
  "Picked",
  "Packing",
  "Ready to Assign",
  "Driver Accepted",
  "Started",
  "Delivered",
];

/** Stage offsets (minutes from creation) used to seed stageArrivedAt for mock/demo orders. */
const STAGE_OFFSETS: Record<string, number> = {
  New: 0,
  Picking: 20,
  Picked: 45,
  Packing: 60,
  "Ready to Assign": 80,
  "Driver Accepted": 100,
  Started: 110,
  Delivered: 130,
  Installation: 150,
  "Delivery Failed": 120,
  Cancelled: 90,
  Flagged: 100,
  Replacement: 140,
  Exchange: 140,
};

/**
 * Compute stageArrivedAt timestamps for an order based on its date, time, and current status.
 * For mock/demo orders that don't have live transition timestamps.
 * Only populates stages up to and including the order's current status.
 */
export function computeStageArrivedAt(order: {
  date: string;
  time: string;
  status: OrderStatus;
  tat?: string;
}): Record<string, string> {
  // Parse the order's creation date+time
  const dateStr = order.date; // e.g. "Jul 9" or "May 27"
  const timeStr = order.time; // e.g. "14:30"
  const year = new Date().getFullYear();
  let creationDate = new Date(`${dateStr} ${year} ${timeStr}`);

  // If we have a tat string, we can back-calculate the creation date (ideal for mock data)
  if (order.tat) {
    const match = order.tat.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
    if (match && (match[1] || match[2])) {
      const h = parseInt(match[1] || "0", 10);
      const m = parseInt(match[2] || "0", 10);
      creationDate = new Date(Date.now() - (h * 60 * 60 * 1000 + m * 60 * 1000));
    }
  } else if (isNaN(creationDate.getTime()) || creationDate.getTime() > Date.now()) {
    // Fallback: use current time minus a default offset
    creationDate = new Date(Date.now() - 60 * 60 * 1000);
  }

  const result: Record<string, string> = {};
  const statusIdx = STAGE_ORDER.indexOf(order.status);

  // Determine elapsed time from creation until now
  const totalElapsedMin = Math.max(1, (Date.now() - creationDate.getTime()) / (60 * 1000));

  // Determine the default offset for the current status (or fallback)
  const maxDefaultOffset = STAGE_OFFSETS[order.status] ?? 120;

  // Proportional scale factor
  // If total elapsed time is less than the stage's default offset, scale all offsets down
  // so the current stage is reached at 90% of the elapsed time.
  const scaleFactor = totalElapsedMin < maxDefaultOffset
    ? (totalElapsedMin * 0.9) / maxDefaultOffset
    : 1.0;

  // For statuses in the main lifecycle
  if (statusIdx >= 0) {
    for (let i = 0; i <= statusIdx; i++) {
      const stage = STAGE_ORDER[i];
      const offset = STAGE_OFFSETS[stage] ?? 0;
      const adjustedOffset = offset * scaleFactor;
      result[stage] = new Date(creationDate.getTime() + adjustedOffset * 60 * 1000).toISOString();
    }
  } else {
    // For non-lifecycle statuses (Cancelled, Delivery Failed, Flagged, Replacement, Exchange, Installation)
    // Still populate the stages it would have passed through
    // All these orders went through at least New → Picking → Picked → Packing → Ready to Assign
    const passedStages = ["New", "Picking", "Picked", "Packing", "Ready to Assign"];

    // Some statuses imply delivery was attempted
    const deliveryStatuses = ["Delivery Failed", "Delivered", "Installation", "Replacement", "Exchange"];
    if (deliveryStatuses.includes(order.status)) {
      passedStages.push("Driver Accepted", "Started");
    }

    for (const stage of passedStages) {
      const offset = STAGE_OFFSETS[stage] ?? 0;
      const adjustedOffset = offset * scaleFactor;
      result[stage] = new Date(creationDate.getTime() + adjustedOffset * 60 * 1000).toISOString();
    }

    // Add the current status itself
    const currentOffset = STAGE_OFFSETS[order.status] ?? 120;
    const adjustedOffset = currentOffset * scaleFactor;
    result[order.status] = new Date(creationDate.getTime() + adjustedOffset * 60 * 1000).toISOString();
  }

  return result;
}

/**
 * Calculates display TAT string for an order based on the active tab/stage context.
 *
 * Requirements:
 * - On ALL, Unfulfilled, or New tabs: TAT is displayed from the time the order arrived in the "New" tab (creation time).
 * - On stage-specific tabs (Picking, Picked, Packing, Ready to Assign, In Delivery, Delivered, Installation, etc.):
 *   TAT is displayed from the time the order arrived in THAT specific list/stage.
 * - On Delivered tab/stage: TAT is total delivery duration from creation (New) to delivery timestamp.
 * - If the order has NOT yet reached the requested stage, display "—".
 */
export function getDisplayTat(
  order?: Order | null,
  activeTab?: LegacyTabId | OrderStatus | string
): string {
  if (!order) return "0m";

  const tab = activeTab || "All";

  // Resolve stageArrivedAt — use existing data, or compute from date+time for mock orders
  let arrivedAt = order.stageArrivedAt && Object.keys(order.stageArrivedAt).length > 0
    ? order.stageArrivedAt
    : computeStageArrivedAt(order);

  // 1. ALL, Unfulfilled, New -> TAT from arrival in New tab (order creation)
  if (tab === "All" || tab === "Unfulfilled" || tab === "New") {
    if (arrivedAt["New"]) {
      const newTime = new Date(arrivedAt["New"]).getTime();
      if (isNaN(newTime) || newTime > Date.now()) {
        arrivedAt = computeStageArrivedAt(order);
      }
      return formatTatFromTimestamp(arrivedAt["New"]);
    }
    // Final fallback: use date+time field to compute live
    return order.tat || "0m";
  }

  // 2. Stage-specific tabs (mapping only actual workflow stages)
  const stageKeyMap: Record<string, string> = {
    "Picking": "Picking",
    "Picked": "Picked",
    "Packing": "Packing",
    "Ready to Assign": "Ready to Assign",
    "In Delivery": "Driver Accepted",
    "Driver Accepted": "Driver Accepted",
    "Started": "Started",
    "Delivered": "Delivered",
    "Installation": "Installation",
    "Delivery Failed": "Delivery Failed",
    "Flagged": "Flagged",
    "Replacement": "Replacement",
    "Exchange": "Exchange",
  };

  let key = stageKeyMap[tab];

  // If the tab is a virtual filter tab (like Flags & Exceptions, PayLater, etc.)
  if (!key) {
    // Fall back to the order's actual status stage key
    key = stageKeyMap[order.status] || order.status;
  }

  // Validate the stage arrival timestamp: if it's in the future or invalid, re-compute
  if (arrivedAt[key]) {
    const stageTime = new Date(arrivedAt[key]).getTime();
    if (isNaN(stageTime) || stageTime > Date.now()) {
      arrivedAt = computeStageArrivedAt(order);
    }
  }

  // 3. Delivered stage special handling: Total TAT from order arrival (New) to Delivered timestamp
  if (key === "Delivered") {
    if (arrivedAt["Delivered"] && arrivedAt["New"]) {
      return formatTatBetweenTimestamps(arrivedAt["New"], arrivedAt["Delivered"]);
    }
    if (order.status === "Delivered" && arrivedAt["New"]) {
      return formatTatFromTimestamp(arrivedAt["New"]);
    }
    return "—";
  }

  // Check if order has a timestamp for this stage
  if (arrivedAt[key]) {
    return formatTatFromTimestamp(arrivedAt[key]);
  }

  // Order has NOT reached this stage — show "—"
  return "—";
}

export type OrderSlaStatus = "on_track" | "at_risk" | "breached";

/** Calculate order elapsed minutes based on TAT string */
export function getOrderElapsedMinutes(order: Order): number {
  if (order.tat) {
    return Math.round(parseTatHours(order.tat) * 60);
  }
  return 0;
}

/** Compute 4-hour SLA status and remaining time for an order */
export function getOrderSlaStatus(order: Order): {
  status: OrderSlaStatus;
  elapsedMinutes: number;
  remainingMinutes: number;
  label: string;
} {
  if (order.status === "Delivered") {
    return { status: "on_track", elapsedMinutes: 0, remainingMinutes: 240, label: "SLA Met" };
  }
  const elapsedMinutes = getOrderElapsedMinutes(order);
  const targetMinutes = 240; // 4 hours continuous SLA
  const remainingMinutes = targetMinutes - elapsedMinutes;

  if (elapsedMinutes > targetMinutes || order.status === "Delivery Failed") {
    return { status: "breached", elapsedMinutes, remainingMinutes, label: "SLA Breached" };
  }
  if (remainingMinutes <= 60) {
    return { status: "at_risk", elapsedMinutes, remainingMinutes, label: "At Risk" };
  }
  return { status: "on_track", elapsedMinutes, remainingMinutes, label: "On Track" };
}

/** Calculate unified item count across Order lists and Order Details */
export function getOrderItemsCount(order: { itemsList?: OrderItemType[]; items?: number }): number {
  if (order.itemsList && order.itemsList.length > 0) {
    return order.itemsList.reduce((sum, item) => sum + item.qty, 0);
  }
  return order.items || 0;
}

export function getDeliveryDate(order: { date: string; deliveryDate?: string }): string {
  if (order.deliveryDate) return order.deliveryDate;
  try {
    const currentYear = new Date().getFullYear();
    const dateObj = new Date(`${order.date}, ${currentYear}`);
    if (!isNaN(dateObj.getTime())) {
      dateObj.setDate(dateObj.getDate() + 1);
      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  } catch (e) {
    // ignore
  }
  return order.date;
}

/** All mock orders for this customer (newest-first by order id). */
export function getOrdersForCustomerId(customerId: string): Order[] {
  return MOCK_ORDERS.filter((o) => o.customerId === customerId).sort((a, b) =>
    a.id < b.id ? 1 : a.id > b.id ? -1 : 0,
  );
}

/** First / primary order row for this customer id (profile anchor). */
export function getCustomerById(customerId: string): Order | undefined {
  const list = getOrdersForCustomerId(customerId);
  return list[0];
}

/** Resolve any user email to display name from local user registry */
export function getUserDisplayName(userValue: string | null | undefined): string {
  if (!userValue) return "";
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const rawUsers = localStorage.getItem("hm_users");
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const found = users.find((u: any) => u.email === userValue || u.name === userValue);
        if (found && found.name) {
          return found.name;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return userValue;
}

export const getPickerDisplayName = getUserDisplayName;

