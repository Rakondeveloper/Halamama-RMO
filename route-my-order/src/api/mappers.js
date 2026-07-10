/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ERPNext ↔ RouteMyOrder Data Mappers                                          ║
 * ║                                                                              ║
 * ║  Translates raw ERPNext Sales Orders and Items into the exact shape          ║
 * ║  expected by the RouteMyOrder pages (Picker, Packer, and Driver).            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Maps standard ERPNext status to RouteMyOrder statuses:
 * 'new' -> 'picking' -> 'packed' -> 'packing' -> 'assigning' -> 'assigned' -> 'delivered' / 'failed'
 */
function mapStatus(erpStatus, pickingStatus, packingStatus) {
  if (erpStatus === "Cancelled") return "failed";
  if (erpStatus === "Completed" || erpStatus === "To Bill") return "delivered";
  if (erpStatus === "Driver Accepted") return "assigned";
  if (erpStatus === "Started") return "started";
  if (erpStatus === "Delivery Failed") return "failed";

  // Map based on warehouse pipeline
  if (packingStatus === "Completed" || erpStatus === "To Deliver") return "assigning";
  if (pickingStatus === "Completed" && packingStatus === "In Progress") return "packing";
  if (pickingStatus === "Completed") return "packed"; // Ready for packer
  if (pickingStatus === "In Progress") return "picking";

  return "new";
}

/**
 * Translates an ERPNext Item -> RouteMyOrder Item
 */
export function mapErpNextItemToRmoItem(item) {
  return {
    sku: item.item_code,
    name: item.item_name,
    qty: item.qty || 1,
    picked: item.custom_status === "Prepared" || item.custom_status === "Picked" || !!item.picked,
  };
}

/**
 * Translates one raw ERPNext Sales Order -> RouteMyOrder Order Object
 */
export function mapErpNextToRmoOrder(raw) {
  const transactionDate = raw.transaction_date 
    ? new Date(raw.transaction_date).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) 
    : '5/20/2026 • 08:11 AM';

  const tags = raw.custom_tags ? raw.custom_tags.split(',').map(t => t.trim()) : [];
  const status = mapStatus(raw.status, raw.custom_picking_status, raw.custom_packing_status);

  // Resolve assignedTo depending on the workflow status of the order to avoid picker/packer priority override
  let assignedTo = null;
  if (["assigning", "assigned", "started", "delivered", "failed"].includes(status)) {
    assignedTo = raw.custom_driver || null;
  } else if (["packed", "packing"].includes(status)) {
    assignedTo = raw.custom_packer || null;
  } else {
    assignedTo = raw.custom_picker || null;
  }

  return {
    id: raw.name,
    customer: raw.customer_name || raw.customer || "Unknown Customer",
    address: [raw.custom_shipping_address_line1, raw.custom_shipping_city].filter(Boolean).join(", ") || raw.custom_city || "Doha, Qatar",
    phone: raw.contact_phone || "",
    total: raw.grand_total || 0,
    status,
    items: (raw.items || []).map(mapErpNextItemToRmoItem),
    bags: raw.custom_bags || 0,
    assignedTo,
    pickedBy: raw.custom_picker || null,
    pickerName: raw.custom_picker ? raw.custom_picker.split('@')[0] : null,
    packedBy: raw.custom_packer || null,
    packerName: raw.custom_packer ? raw.custom_packer.split('@')[0] : null,
    date: transactionDate.replace(",", " •"),
    tags,
    bagVerificationStatus: raw.custom_bag_verification_status || null,
    zone: raw.custom_zone || "",
  };
}
