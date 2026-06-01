import type { Order } from "./orders";
import { getCustomerById, getOrdersForCustomerId } from "./orders";

export interface CustomerAddress {
  recipientName: string;
  street: string;
  zone: string;
  houseNumber: string;
  area: string;
  city: string;
  country: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export interface CustomerPaymentSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  balance: number;
  status: "Paid" | "Pending" | "Overdue";
}

export interface CustomerReturnRow {
  id: string;
  orderId: string;
  status: string;
  createdAt: string;
  amount: number;
}

export interface CustomerEnrichment {
  notes: string;
  internalRef: string;
  address: CustomerAddress;
  payment: CustomerPaymentSummary;
  returns: CustomerReturnRow[];
  billingAlert?: string;
}

const ENRICHMENTS: Record<string, CustomerEnrichment> = {
  "cust-59244": {
    notes:
      "VIP delivery window preferred after 4pm. Internal UUID: 8f2a1c9e-4b3d-4e11-9c0a-2d7e6f1a8b00 — confirm gate code with concierge before dispatch.",
    internalRef: "8f2a1c9e-4b3d-4e11-9c0a-2d7e6f1a8b00",
    address: {
      recipientName: "Khalid Saleh",
      street: "Al Sadd St.",
      zone: "Zone 38",
      houseNumber: "Villa 12",
      area: "Al Sadd",
      city: "Doha",
      country: "Qatar",
      phone: "+974 55667788",
      latitude: 25.2854,
      longitude: 51.531,
    },
    payment: {
      subtotal: 1355,
      discount: 45,
      shipping: 25,
      total: 1335,
      balance: 0,
      status: "Paid",
    },
    returns: [],
    billingAlert: undefined,
  },
  "cust-59243": {
    notes: "Shopify sync verified. Leave at reception if no answer.",
    internalRef: "ref-cust-59243-lusail",
    address: {
      recipientName: "Layla Hassan",
      street: "Marina Promenade",
      zone: "Zone 69",
      houseNumber: "Tower B / 1408",
      area: "Lusail",
      city: "Lusail",
      country: "Qatar",
      phone: "+974 33112244",
      latitude: 25.4194,
      longitude: 51.5069,
    },
    payment: {
      subtotal: 540,
      discount: 0,
      shipping: 15,
      total: 555,
      balance: 55,
      status: "Pending",
    },
    returns: [
      { id: "RET-1042", orderId: "HM59243", status: "Requested", createdAt: "May 12, 2026", amount: 120 },
    ],
    billingAlert: "Billing account not assigned",
  },
};

function defaultEnrichment(primary: Order): CustomerEnrichment {
  return {
    notes: "No internal notes yet.",
    internalRef: `ref-${primary.customerId}`,
    address: {
      recipientName: primary.customer.name,
      street: "—",
      zone: primary.city,
      houseNumber: "—",
      area: primary.city,
      city: primary.city,
      country: "Qatar",
      phone: primary.customer.phone,
      latitude: 25.2867,
      longitude: 51.5333,
    },
    payment: {
      subtotal: primary.total,
      discount: 0,
      shipping: primary.total > 0 ? 15 : 0,
      total: primary.total + (primary.total > 0 ? 15 : 0),
      balance: 0,
      status: "Paid",
    },
    returns: [],
  };
}

export function getCustomerEnrichment(primary: Order): CustomerEnrichment {
  return ENRICHMENTS[primary.customerId] ?? defaultEnrichment(primary);
}

export interface CustomerPageData {
  primary: Order;
  orders: Order[];
  enrichment: CustomerEnrichment;
}

export function getCustomerPageData(customerId: string): CustomerPageData | null {
  const primary = getCustomerById(customerId);
  if (!primary) return null;
  return {
    primary,
    orders: getOrdersForCustomerId(customerId),
    enrichment: getCustomerEnrichment(primary),
  };
}

export function mapsUrlFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
