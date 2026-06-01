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
  | "Installation";

export type LegacyTabId =
  | "New"
  | "Installation"
  | "Unfulfilled"
  | "Picking"
  | "Picked"
  | "Packing"
  | "Ready to Assign"
  | "Driver Accepted"
  | "Started"
  | "Delivery Failed"
  | "Delivered"
  | "Flags & Exceptions"
  | "Cancelled"
  | "Returns & Replacements"
  | "Replacement"
  | "Exchange"
  | "All";

export interface LegacyTab {
  id: LegacyTabId;
  label: string;
  color: string;
  activeColor: string;
}

export const LEGACY_TABS: LegacyTab[] = [
  { id: "New", label: "New", color: "text-sky-600 dark:text-sky-400", activeColor: "bg-sky-500" },
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
    id: "Driver Accepted",
    label: "Driver Accepted",
    color: "text-blue-600 dark:text-blue-400",
    activeColor: "bg-blue-500",
  },
  {
    id: "Started",
    label: "Started",
    color: "text-cyan-600 dark:text-cyan-400",
    activeColor: "bg-cyan-500",
  },
  {
    id: "Delivery Failed",
    label: "Delivery Failed",
    color: "text-red-600 dark:text-red-400",
    activeColor: "bg-red-500",
  },
  {
    id: "Delivered",
    label: "Delivered",
    color: "text-emerald-600 dark:text-emerald-400",
    activeColor: "bg-emerald-500",
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
  { id: "All", label: "All", color: "text-foreground", activeColor: "bg-primary" },
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
  city: string;
  coordinator: string;
  driver: string | null;
  driverStatus?: string | null;
  picker: string | null;
  packer: string | null;
  total: number;
  shopify: "Fulfilled" | "Unfulfilled" | "Pending";
  pickingStatus?: string;
  packingStatus?: string;
  bags?: number;
}

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
  status: "Prepared" | "Accepted" | "Allocated" | "Pending";
  /** Whether this item has been scheduled for installation */
  isScheduled?: boolean;
  /** ISO timestamp of when it was scheduled */
  scheduledAt?: string;
  /** Driver/installer assigned for the installation */
  installationDriver?: string | null;
}

export interface OrderReturn {
  id: string;
  itemName: string;
  type: "return" | "replacement";
  qty: number;
  status: "pending" | "picked up" | "completed";
  source: "Shopify" | "Web";
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
    | "delivery_failed";
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
    ev.push({
      id: "tl-picker-assigned",
      title: `Picker assigned: ${base.picker} at ${fcName}`,
      ...t5,
      description: `By: ${base.picker} · ${fcName} (${fcCode})`,
      actor: base.picker!,
      actorRole: "picker",
      facility: `${fcName} (${fcCode})`,
      hasRawDetails: true,
      type: "picker_assigned",
    });

    // ── 11. Item picked (per item) ─────────────────────────────────────────
    itemNames.forEach((_, i) => {
      ev.push({
        id: `tl-item-picked-${i}`,
        title: `Item picked (qty: 1) by ${base.picker}`,
        ...fmt(base.date, base.time, 5 + i + 1),
        description: `By: ${base.picker}`,
        actor: base.picker!,
        actorRole: "picker",
        hasRawDetails: true,
        type: "item_picked",
      });
    });

    // ── 12. Picking completed ──────────────────────────────────────────────
    ev.push({
      id: "tl-pick-end",
      title: `Picking completed by ${base.picker}`,
      ...t8,
      description: `By: ${base.picker}`,
      actor: base.picker!,
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
    ev.push({
      id: "tl-packer-assigned",
      title: `Packer assigned: ${base.packer} at ${fcName}`,
      ...t15,
      description: `By: ${base.packer} · ${fcName} (${fcCode})`,
      actor: base.packer!,
      actorRole: "packer",
      facility: `${fcName} (${fcCode})`,
      type: "packer_assigned",
    });

    // ── 14. Item packed (per item) ─────────────────────────────────────────
    itemNames.forEach((_, i) => {
      ev.push({
        id: `tl-item-packed-${i}`,
        title: `Item packed (qty: 1) by ${base.packer}`,
        ...fmt(base.date, base.time, 15 + i + 1),
        description: `By: ${base.packer}`,
        actor: base.packer!,
        actorRole: "packer",
        hasRawDetails: true,
        type: "item_packed",
      });
    });

    // ── 15. Packing completed ──────────────────────────────────────────────
    const bags = base.bags ?? 1;
    ev.push({
      id: "tl-pack-end",
      title: `Packing completed — ${bags} bag(s) by ${base.packer}`,
      ...t20,
      description: `By: ${base.packer}`,
      actor: base.packer!,
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
    const assigner = base.coordinator !== "-" ? base.coordinator : "suhail_halamama";
    ev.push({
      id: "tl-drv-assign",
      title: `Driver assigned: ${base.driver} by ${assigner}`,
      ...t25,
      description: `By: ${assigner} · Driver: ${base.driver}\nDriver assigned internally (forced)`,
      actor: assigner,
      actorRole: "admin",
      metadata: { driver: base.driver!, method: "internally (forced)" },
      type: "driver_assigned",
    });

    // ── 17. Bags verified ──────────────────────────────────────────────────
    ev.push({
      id: "tl-bags-verified",
      title: `Bags verified by ${base.driver}`,
      ...t35,
      description: `By: ${base.driver}\nDriver verified bags match & count`,
      actor: base.driver!,
      actorRole: "driver",
      type: "bags_verified",
    });

    // ── 18. Driver started trip ────────────────────────────────────────────
    if (isDelivered || isActive) {
      ev.push({
        id: "tl-started",
        title: `Driver ${base.driver} started trip`,
        ...t35,
        description: `By: ${base.driver}`,
        actor: base.driver!,
        actorRole: "driver",
        type: "started",
      });
    }
  }

  // ── 19–25. Delivered + post-delivery automation ─────────────────────────────
  if (isDelivered) {
    // Delivery event
    ev.push({
      id: "tl-delivered",
      title: `Order delivered by ${base.driver}`,
      ...t58,
      description: `By: ${base.driver}`,
      actor: base.driver!,
      actorRole: "driver",
      type: "delivered",
    });

    // Delivered (with payment details)
    ev.push({
      id: "tl-delivered-payment",
      title: `Order delivered by ${base.driver}`,
      ...t58,
      description: `By: ${base.driver}\nPayment: cash (Amount: ${base.total})`,
      actor: base.driver!,
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

  return ev;
}

/** Mock enriched order for the details page */
export function getEnrichedOrder(id: string): EnrichedOrder | undefined {
  const baseOrder = MOCK_ORDERS.find((o) => o.id === id);
  if (!baseOrder) return undefined;

  const itemsList: OrderItemType[] = [
    {
      id: "item-1",
      name: "Frida Baby NoseFrida Saline Snot Spray",
      sku: "NS-SPNC-1P-0200",
      barcode: "9350764006338",
      image: "https://images.unsplash.com/photo-1584305574647-0cc9ebecf2fb?w=100&h=100&fit=crop",
      qty: 3,
      price: 31.0,
      fc: "F01",
      fcName: "Fulfillment Center Hilal",
      bin: "B-252 / 4",
      status: "Prepared",
    },
    ...(baseOrder.items > 1
      ? [
          {
            id: "item-2",
            name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)",
            sku: "5021933",
            barcode: "9350764006339",
            image:
              "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
            qty: 1,
            price: 599.0,
            fc: "F01",
            fcName: "Fulfillment Center Hilal",
            bin: "B-100 / 1",
            status: "Allocated",
          } as OrderItemType,
        ]
      : []),
  ];

  return {
    ...baseOrder,
    zone: "No Zone",
    itemsList,
    returnsList: baseOrder.returns
      ? [
          {
            id: "ret-1",
            itemName: "Beurer Sugar Machine With 50 Strips",
            type: "return",
            qty: 1,
            status: "picked up",
            source: "Shopify",
          },
        ]
      : [],
    timeline: buildTimelineFor(baseOrder, itemsList),
    payment: {
      method: "Cash",
      totalPaid: baseOrder.total,
      cash: baseOrder.total,
      card: 0,
      subtotal: baseOrder.total - 10,
      discount: 0,
      shipping: 10,
      total: baseOrder.total,
      balance: 0,
      shippingMethod: "Standard Delivery",
    },
    notes: "Please leave at the door if no one answers.",
    shippingAddress: {
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
        items: [
          { sku: "NS-SPNC-1P-0200", req: 3, available: 0 },
          { sku: "5021933", req: 1, available: 0 },
        ],
      },
      {
        fc: "P63",
        fcName: "Outlet P63",
        items: [
          { sku: "NS-SPNC-1P-0200", req: 3, available: 3 },
          { sku: "5021933", req: 1, available: 0 },
        ],
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
    id: "HM59238",
    customerId: "cust-59238",
    tat: "642h 50m",
    date: "Apr 16",
    time: "18:34",
    customer: { name: "test test", email: "nandu@halamama.com", phone: "77532802" },
    channel: "web",
    items: 0,
    status: "Cancelled",
    returns: { type: "Return", count: 1 },
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
  },
  {
    id: "HM59239",
    customerId: "cust-59239",
    tat: "642h 49m",
    date: "Apr 16",
    time: "18:35",
    customer: { name: "Sara Alsooj", email: "bent-alsooj@hotmail.com", phone: "55339494" },
    channel: "5382175",
    items: 2,
    status: "Delivered",
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
  },
  {
    id: "HM59240",
    customerId: "cust-59240",
    tat: "642h 47m",
    date: "Apr 16",
    time: "18:37",
    customer: { name: "ayah sukik", email: "ayahsukik@gmail.com", phone: "55571800" },
    channel: "web",
    items: 4,
    status: "Delivered",
    city: "Doha",
    coordinator: "-",
    driver: "farshad",
    driverStatus: "Completed",
    picker: "adhil",
    packer: "mashood",
    total: 1276,
    shopify: "Fulfilled",
    pickingStatus: "4/4 Picked",
    packingStatus: "4/4 Packed",
    bags: 2,
  },
  {
    id: "HM59241",
    customerId: "cust-59241",
    tat: "642h 45m",
    date: "Apr 16",
    time: "18:39",
    customer: { name: "amanda menzies", email: "amandamenzies1@gmail.com", phone: "50344139" },
    channel: "web",
    items: 1,
    status: "Delivered",
    city: "DOHA",
    coordinator: "-",
    driver: "nassim",
    driverStatus: "Completed",
    picker: "rahul",
    packer: "packer1",
    total: 129,
    shopify: "Fulfilled",
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
  },
  {
    id: "HM59242",
    customerId: "cust-59242",
    tat: "642h 41m",
    date: "Apr 16",
    time: "18:43",
    customer: { name: "Nijin Mohammed navas", email: "nijinmohd@yahoo.com", phone: "33850648" },
    channel: "web",
    items: 1,
    status: "Delivered",
    city: "Kharthiyat",
    coordinator: "-",
    driver: "farshad",
    driverStatus: "Completed",
    picker: "noushad",
    packer: "packer1",
    total: 279,
    shopify: "Fulfilled",
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
  },
  {
    id: "HM59243",
    customerId: "cust-59243",
    tat: "12h 04m",
    date: "May 13",
    time: "08:12",
    customer: { name: "Layla Hassan", email: "layla.h@gmail.com", phone: "33112244" },
    channel: "shopify",
    items: 3,
    status: "Ready to Assign",
    city: "Lusail",
    coordinator: "Omar",
    driver: null,
    picker: "rahul",
    packer: "packer1",
    total: 540,
    shopify: "Pending",
    pickingStatus: "3/3 Picked",
    packingStatus: "3/3 Packed",
    bags: 1,
  },
  {
    id: "HM59244",
    customerId: "cust-59244",
    tat: "00h 22m",
    date: "May 13",
    time: "10:45",
    customer: { name: "Khalid Saleh", email: "ksaleh@gmail.com", phone: "55667788" },
    channel: "web",
    items: 5,
    status: "New",
    city: "Al Sadd",
    coordinator: "-",
    driver: null,
    picker: null,
    packer: null,
    total: 820,
    shopify: "Unfulfilled",
    pickingStatus: "0/5 Picked",
    packingStatus: "0/5 Packed",
    bags: 0,
  },
  {
    id: "HM64110",
    customerId: "cust-64110",
    tat: "00h 28m",
    date: "May 27",
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
  },
  {
    id: "HM64112",
    customerId: "cust-64112",
    tat: "00h 58m",
    date: "May 27",
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
  },
  {
    id: "HM64114",
    customerId: "cust-64114",
    tat: "26h 13m",
    date: "May 26",
    time: "08:30",
    customer: { name: "Fatima Al-Kuwari", email: "fatima.k@halamama.com", phone: "77665544" },
    channel: "shopify",
    items: 3,
    status: "Unfulfilled",
    city: "Al Waab",
    coordinator: "Rania",
    driver: null,
    picker: "adhil",
    packer: null,
    total: 490,
    shopify: "Unfulfilled",
    pickingStatus: "1/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
  },
  {
    id: "HM64116",
    customerId: "cust-64116",
    tat: "01h 31m",
    date: "May 27",
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
  },
  {
    id: "HM64118",
    customerId: "cust-64118",
    tat: "02h 03m",
    date: "May 27",
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
  },
  {
    id: "HM64120",
    customerId: "cust-64120",
    tat: "20h 28m",
    date: "May 26",
    time: "14:15",
    customer: { name: "Yousef Al-Malki", email: "yousef.m@live.com", phone: "33221199" },
    channel: "web",
    items: 1,
    status: "Picked",
    city: "Al Rayyan",
    coordinator: "Rania",
    driver: null,
    picker: "noushad",
    packer: "packer1",
    total: 190,
    shopify: "Pending",
    pickingStatus: "1/1 Picked",
    packingStatus: "0/1 Packed",
    bags: 0,
  },
  {
    id: "HM60100",
    customerId: "cust-59244",
    tat: "48h 12m",
    date: "May 11",
    time: "14:20",
    customer: { name: "Khalid Saleh", email: "ksaleh@gmail.com", phone: "55667788" },
    channel: "web",
    items: 2,
    status: "Delivered",
    city: "Al Sadd",
    coordinator: "-",
    driver: "farshad",
    driverStatus: "Completed",
    picker: "rahul",
    packer: "packer1",
    total: 340,
    shopify: "Fulfilled",
    pickingStatus: "2/2 Picked",
    packingStatus: "2/2 Packed",
    bags: 1,
  },
  {
    id: "HM60090",
    customerId: "cust-59244",
    tat: "120h 00m",
    date: "May 8",
    time: "09:15",
    customer: { name: "Khalid Saleh", email: "ksaleh@gmail.com", phone: "55667788" },
    channel: "shopify",
    items: 1,
    status: "Delivered",
    city: "Al Sadd",
    coordinator: "-",
    driver: "irshad",
    driverStatus: "Accepted",
    picker: "adhil",
    packer: null,
    total: 195,
    shopify: "Fulfilled",
    pickingStatus: "1/1 Picked",
    packingStatus: "0/1 Packed",
    bags: 0,
  },
  {
    id: "HM60101",
    customerId: "cust-60101",
    tat: "00h 42m",
    date: "May 13",
    time: "11:18",
    customer: { name: "Maha Al-Kaabi", email: "maha.kaabi@gmail.com", phone: "55221109" },
    channel: "shopify",
    items: 3,
    status: "Unfulfilled",
    city: "West Bay",
    coordinator: "Omar",
    driver: null,
    picker: null,
    packer: null,
    total: 455,
    shopify: "Unfulfilled",
    pickingStatus: "0/3 Picked",
    packingStatus: "0/3 Packed",
    bags: 0,
  },
  {
    id: "HM60102",
    customerId: "cust-60102",
    tat: "01h 15m",
    date: "May 13",
    time: "11:44",
    customer: { name: "Noora Salem", email: "noora.salem@gmail.com", phone: "55199220" },
    channel: "web",
    items: 6,
    status: "Picked",
    city: "The Pearl",
    coordinator: "Rania",
    driver: null,
    picker: "adhil",
    packer: null,
    total: 690,
    shopify: "Pending",
    pickingStatus: "6/6 Picked",
    packingStatus: "0/6 Packed",
    bags: 2,
  },
  {
    id: "HM60103",
    customerId: "cust-60103",
    tat: "02h 06m",
    date: "May 13",
    time: "12:08",
    customer: { name: "Faisal Al-Marri", email: "faisal.marri@gmail.com", phone: "55987123" },
    channel: "web",
    items: 2,
    status: "Ready to Assign",
    city: "Al Waab",
    coordinator: "Omar",
    driver: null,
    picker: "rahul",
    packer: "mashood",
    total: 315,
    shopify: "Pending",
    pickingStatus: "2/2 Picked",
    packingStatus: "2/2 Packed",
    bags: 1,
  },
  {
    id: "HM60104",
    customerId: "cust-60104",
    tat: "03h 22m",
    date: "May 13",
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
  },
  {
    id: "HM60105",
    customerId: "cust-60105",
    tat: "04h 03m",
    date: "May 13",
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
  },
  {
    id: "HM60106",
    customerId: "cust-60106",
    tat: "05h 37m",
    date: "May 13",
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
  },
  {
    id: "HM60107",
    customerId: "cust-60107",
    tat: "06h 10m",
    date: "May 13",
    time: "14:26",
    customer: { name: "Lina Qassim", email: "lina.qassim@gmail.com", phone: "55990031" },
    channel: "shopify",
    items: 2,
    status: "Replacement",
    returns: { type: "Return", count: 1 },
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
  },
  {
    id: "HM60108",
    customerId: "cust-60108",
    tat: "07h 25m",
    date: "May 13",
    time: "15:04",
    customer: { name: "Othman Kareem", email: "othman.kareem@gmail.com", phone: "55447766" },
    channel: "web",
    items: 3,
    status: "Exchange",
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
  },
  {
    id: "HM63850",
    customerId: "cust-63850",
    tat: "154h 34m",
    date: "May 20",
    time: "02:53",
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
  },
  {
    id: "HM63859",
    customerId: "cust-63859",
    tat: "148h 4m",
    date: "May 20",
    time: "09:23",
    customer: { name: "haya abdulla", email: "um.fouz2022@gmail.com", phone: "50044141" },
    channel: "web" as const,
    items: 1,
    status: "Installation" as const,
    city: "doha",
    coordinator: "-",
    driver: "mwd_nishad",
    driverStatus: "Completed",
    picker: "adhil",
    packer: "mashood",
    total: 1399,
    shopify: "Fulfilled" as const,
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
  },
  {
    id: "HM63872",
    customerId: "cust-63872",
    tat: "145h 34m",
    date: "May 20",
    time: "11:54",
    customer: { name: "Kamla Abdulla", email: "umessax44@icloud.com", phone: "55511532" },
    channel: "web" as const,
    items: 1,
    status: "Installation" as const,
    city: "الدوحة",
    coordinator: "-",
    driver: "mwd_naveed",
    driverStatus: "Completed",
    picker: "noushad",
    packer: "packer1",
    total: 499,
    shopify: "Fulfilled" as const,
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
  },
  {
    id: "HM63883",
    customerId: "cust-63883",
    tat: "144h 37m",
    date: "May 20",
    time: "12:51",
    customer: { name: "عبدالرحمن النصر", email: "bomeq@hotmail.com", phone: "55829966" },
    channel: "web" as const,
    items: 1,
    status: "Installation" as const,
    city: "الأ وجة",
    coordinator: "-",
    driver: "mwd_naveed",
    driverStatus: "Completed",
    picker: "rahul",
    packer: "mashood",
    total: 499,
    shopify: "Fulfilled" as const,
    pickingStatus: "1/1 Picked",
    packingStatus: "1/1 Packed",
    bags: 1,
  },
];

export const ORDER_STATS = [
  {
    label: "Picking",
    value: MOCK_ORDERS.filter(
      (order) => order.status === "Picked",
    ).length.toLocaleString(),
    icon: Package,
    tone: "violet" as const,
  },
  {
    label: "Packing",
    value: MOCK_ORDERS.filter(
      (order) => order.status === "Ready to Assign",
    ).length.toLocaleString(),
    icon: PackageCheck,
    tone: "primary" as const,
  },
  {
    label: "Delivered",
    value: MOCK_ORDERS.filter(
      (order) => order.status === "Delivered",
    ).length.toLocaleString(),
    icon: Truck,
    tone: "primary" as const,
  },
  {
    label: "Revenue",
    value: `QAR ${Math.round(MOCK_ORDERS.reduce((sum, order) => sum + order.total, 0) / 1000)}K`,
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
  const hours = parseTatHours(tat);
  if (hours <= 2) return "text-emerald-600 dark:text-emerald-400";
  if (hours <= 12) return "text-amber-600 dark:text-amber-400";
  if (hours <= 24) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
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
