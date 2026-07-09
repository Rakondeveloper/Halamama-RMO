import { isDemoMode } from './config.js';
import { getProducts } from './products.js';
import { getVendorLocations } from './vendor-locations.js';

const STORAGE_KEY = 'hm_shared_orders';
const SYNC_EVENT_KEY = 'hm_sync_signal';
const USERS_KEY = 'hm_users';

// ─── Routing Resolver ────────────────────────────────────────────────────

function resolveDynamicRoutingForRmo(itemsList) {
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

// ─── Status Mapping: Admin ↔ RMO ────────────────────────────────────────

/**
 * Map admin status names to RMO status names.
 * Admin uses PascalCase/Title Case, RMO uses lowercase.
 */
const ADMIN_TO_RMO_STATUS = {
  'New': 'new',
  'Unfulfilled': 'new',
  'Picking': 'picking',
  'Picked': 'packed',
  'Packing': 'packing',
  'Ready to Assign': 'assigning',
  'Driver Accepted': 'assigned',
  'Started': 'assigned',
  'Delivered': 'delivered',
  'Delivery Failed': 'failed',
  'Cancelled': 'cancelled',
  'Flagged': 'flagged',
  'Replacement': 'replacement',
  'Exchange': 'exchange',
  'Installation': 'installation',
};

const RMO_TO_ADMIN_STATUS = {
  'new': 'New',
  'picking': 'Picking',
  'packed': 'Picked',
  'packing': 'Packing',
  'assigning': 'Ready to Assign',
  'assigned': 'Driver Accepted',
  'delivered': 'Delivered',
  'failed': 'Delivery Failed',
  'flagged': 'Flagged',
  'replacement': 'Replacement',
  'exchange': 'Exchange',
  'installation': 'Installation',
};

// ─── Read from Shared Store ──────────────────────────────────────────────

/**
 * Read admin-format orders from localStorage and convert to RMO format.
 */
export function getSharedOrdersForRmo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const adminOrders = JSON.parse(raw);
    return adminOrders.map(adminToRmo);
  } catch (e) {
    console.warn('[Sync] Failed to read shared orders:', e);
    return null;
  }
}

/**
 * Convert a single admin-format order to RMO format.
 */
function adminToRmo(adminOrder) {
  const status = ADMIN_TO_RMO_STATUS[adminOrder.status] || 'new';

  let generatedItems = [];
  const rawItems = adminOrder.itemsList || adminOrder.items;
  if (Array.isArray(rawItems)) {
    generatedItems = resolveDynamicRoutingForRmo(rawItems);
  } else {
    const itemsCount = typeof adminOrder.items === 'number' ? adminOrder.items : 0;
    if (itemsCount > 0) {
      const isPicked = ['packed', 'packing', 'assigning', 'assigned', 'delivered'].includes(status);
      generatedItems.push({
        sku: 'NS-SPNC-1P-0200',
        name: 'Frida Baby Saline Spray',
        qty: 1,
        picked: isPicked
      });
      for (let i = 2; i <= itemsCount; i++) {
        generatedItems.push({
          sku: `HM-GEN${i}`,
          name: `Baby Care Product ${i}`,
          qty: 1,
          picked: isPicked
        });
      }
    }
  }

  return {
    id: adminOrder.id,
    customer: adminOrder.customer?.name || adminOrder.customer || 'Unknown',
    address: adminOrder.address || adminOrder.city || 'Doha',
    phone: adminOrder.customer?.phone || '',
    total: adminOrder.total || 0,
    status: status,
    items: generatedItems,
    bags: adminOrder.bags || 0,
    assignedTo: (adminOrder.driver && ['assigning', 'assigned', 'delivered', 'failed'].includes(status))
      ? (adminOrder.driver.includes('@') ? adminOrder.driver : `${adminOrder.driver}@rmo.qa`)
      : (adminOrder.picker
          ? (adminOrder.picker.includes('@') ? adminOrder.picker : `${adminOrder.picker}@rmo.qa`)
          : (adminOrder.packer
              ? (adminOrder.packer.includes('@') ? adminOrder.packer : `${adminOrder.packer}@rmo.qa`)
              : null)),
    date: `${adminOrder.date || ''} • ${adminOrder.time || ''}`,
    // Preserve extra fields
    pickedBy: adminOrder.picker ? (adminOrder.picker.includes('@') ? adminOrder.picker : `${adminOrder.picker}@rmo.qa`) : null,
    pickerName: adminOrder.picker || null,
    packedBy: adminOrder.packer ? (adminOrder.packer.includes('@') ? adminOrder.packer : `${adminOrder.packer}@rmo.qa`) : null,
    packerName: adminOrder.packer || null,
    driverEmail: adminOrder.driver ? (adminOrder.driver.includes('@') ? adminOrder.driver : `${adminOrder.driver}@rmo.qa`) : null,
    tags: adminOrder.tags || [],
    payment: adminOrder.payment || null,
    lat: adminOrder.lat || null,
    lng: adminOrder.lng || null,
    returnItems: adminOrder.returnItems || [],
    returns: adminOrder.returns || null,
    bagVerificationStatus: adminOrder.bagVerificationStatus || null,
    zone: adminOrder.zone || (adminOrder.city && adminOrder.city.toLowerCase().startsWith('zone') ? adminOrder.city : 'West Bay'),
  };
}

// ─── Write Back to Shared Store ──────────────────────────────────────────

/**
 * Update a single order in the shared admin store from RMO.
 * Maps RMO status back to admin format.
 */
export function updateSharedOrderFromRmo(orderId, updater) {
  if (!isDemoMode()) return;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    
    const orders = JSON.parse(raw);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Apply the updater with RMO-to-Admin translation
    updater(order);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return order;
  } catch (e) {
    console.warn('[Sync] Failed to update shared order:', e);
  }
}

/**
 * Signal other tabs (admin dashboard) that data has changed.
 */
export function broadcastChange() {
  localStorage.setItem(SYNC_EVENT_KEY, Date.now().toString());
}

/**
 * Map an RMO status string to admin status string.
 */
export function rmoToAdminStatus(rmoStatus) {
  return RMO_TO_ADMIN_STATUS[rmoStatus] || 'New';
}

// ─── Cross-Tab Listener ──────────────────────────────────────────────────

/**
 * Listen for changes from the admin dashboard and call the callback.
 * Returns an unsubscribe function.
 */
export function onSyncChange(callback) {
  const handler = (event) => {
    if (event.key === SYNC_EVENT_KEY || event.key === STORAGE_KEY || event.key === 'hm_scheduling_sync') {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// ─── User Management Integration ─────────────────────────────────────────

/**
 * Get managed users from admin-created user store.
 * Used by RMO login to validate credentials.
 */
export function getManagedUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * Find a managed user by email.
 */
export function findManagedUser(email) {
  const users = getManagedUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'active');
}

// Seed shared orders for port 5174 if not present (Demo Mode)
export function seedSharedOrdersForRmo() {
  if (!isDemoMode()) return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const defaultShared = [
      {
        id: "HM64110",
        customerId: "cust-64110",
        date: "May 27",
        time: "10:15",
        customer: { name: "Dana Al-Thani", email: "dana.thani@gmail.com", phone: "55223344" },
        items: 2,
        status: "New",
        city: "West Bay",
        total: 5198,
        itemsList: [
          {
            id: "vl-item-1",
            name: "Mima Xari Stroller (Camel)",
            sku: "MX-STR-CAM",
            barcode: "MXSTRCAM001",
            qty: 1,
            price: 3999.0,
            fc: "VL_HMA",
            status: "Prepared",
            itemType: "VL_HMA",
            locationId: "loc-1"
          },
          {
            id: "vl-item-2",
            name: "Stokke Tripp Trapp High Chair (Oak)",
            sku: "ST-TTHC-OAK",
            barcode: "STTTHCOAK001",
            qty: 1,
            price: 1199.0,
            fc: "VL_HMA",
            status: "Prepared",
            itemType: "VL_HMA",
            locationId: "loc-1"
          }
        ]
      },
      {
        id: "HM99001",
        customerId: "cust-99001",
        date: "Jun 16",
        time: "14:00",
        customer: { name: "Salem Al-Marri", email: "salem.marri@example.com", phone: "33224455" },
        items: 2,
        status: "New",
        city: "Doha",
        total: 2198,
        itemsList: [
          {
            id: "vl-item-3",
            name: "Chicco Next2Me Side Sleeping Crib",
            sku: "CC-N2M-CRIB",
            barcode: "CCN2MCRIB01",
            qty: 1,
            price: 899.0,
            fc: "VL_HMA",
            status: "Prepared",
            itemType: "VL_HMA",
            locationId: "loc-1"
          },
          {
            id: "vl-item-4",
            name: "Nuna Leaf Grow Lounger",
            sku: "NL-GROW-LNG",
            barcode: "NLGROWLNG01",
            qty: 1,
            price: 1299.0,
            fc: "VL_HMA",
            status: "Prepared",
            itemType: "VL_HMA",
            locationId: "loc-1"
          }
        ]
      },
      {
        id: "HM99005",
        customerId: "cust-99005",
        date: "Jun 27",
        time: "10:55",
        customer: { name: "Khalid Al-Nuaimi", email: "khalid.nuaimi@example.com", phone: "55776688" },
        items: 3,
        status: "New",
        city: "Doha",
        total: 3197,
        itemsList: [
          {
            id: "test-item-1",
            name: "Happy Hop 6-in-1 Play Center",
            sku: "9060",
            barcode: "90600000001",
            qty: 1,
            price: 1999.0,
            fc: "F01",
            status: "Prepared",
            itemType: "FC"
          },
          {
            id: "test-item-2",
            name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
            sku: "561KC",
            barcode: "56100000002",
            qty: 1,
            price: 799.0,
            fc: "MWO",
            status: "Prepared",
            itemType: "MWH"
          },
          {
            id: "test-item-3",
            name: "Smoby Green XL Slide",
            sku: "820304",
            barcode: "82030400003",
            qty: 1,
            price: 399.0,
            fc: "VS",
            status: "Prepared",
            itemType: "VL_SUPPLIER"
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShared));
  }
}

try {
  seedSharedOrdersForRmo();
} catch (e) {
  console.error("Failed to seed shared orders on RMO:", e);
}
