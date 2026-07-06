/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Products Store — Database Layer                                              ║
 * ║                                                                              ║
 * ║  Manages the product database for dynamic order routing in RouteMyOrder.      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

const STORAGE_KEY = "hm_products";

const SEED_PRODUCTS = [
  // Warehouse F01 / F02 products
  {
    id: "p1",
    sku: "NS-SPNC-1P-0200",
    name: "Frida Baby NoseFrida Saline Snot Spray",
    price: 31.00,
    qty: 150,
    fulfillmentType: "Warehouse",
    locationId: "F01",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p2",
    sku: "5021933",
    name: "SmarTrike STR3 6-in-1 Stroller-Trike (Black)",
    price: 599.00,
    qty: 45,
    fulfillmentType: "Warehouse",
    locationId: "F01",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p3",
    sku: "9060",
    name: "Happy Hop 6-in-1 Play Center",
    price: 1999.00,
    qty: 12,
    fulfillmentType: "Warehouse",
    locationId: "F01",
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p4",
    sku: "9029",
    name: "Happy Hop Double Water Slide – Deluxe",
    price: 1499.00,
    qty: 8,
    fulfillmentType: "Warehouse",
    locationId: "F01",
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  // Warehouse MWO products
  {
    id: "p5",
    sku: "HMP-WPS",
    name: "HalaMama Premium Wooden Playground Set",
    price: 3499.00,
    qty: 15,
    fulfillmentType: "Warehouse",
    locationId: "MWO",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p6",
    sku: "561KC",
    name: "Bestway Apx 365 Round Pool Set (12' x 30\")",
    price: 799.00,
    qty: 28,
    fulfillmentType: "Warehouse",
    locationId: "MWO",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p7",
    sku: "26790",
    name: "Intex Prism Frame Rectangular Pool Set",
    price: 899.00,
    qty: 14,
    fulfillmentType: "Warehouse",
    locationId: "MWO",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  // Virtual Stock locations (Baby Boutique loc-001)
  {
    id: "p8",
    sku: "820304",
    name: "Smoby Green XL Slide",
    price: 399.00,
    qty: 120,
    fulfillmentType: "VS",
    locationId: "loc-001",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p9",
    sku: "58034",
    name: "Bestway Flowclear Pool Cover (12ft)",
    price: 149.00,
    qty: 200,
    fulfillmentType: "VS",
    locationId: "loc-001",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  // Virtual Stock locations (Stokke Boutique loc-002)
  {
    id: "p10",
    sku: "OR0047",
    name: "Peg Perego John Deere Ground Force Tractor",
    price: 2199.00,
    qty: 22,
    fulfillmentType: "VS",
    locationId: "loc-002",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  // Virtual Stock locations (Chicco Boutique loc-003)
  {
    id: "p11",
    sku: "311045",
    name: "Smoby Tefal Studio Kitchen XL",
    price: 649.00,
    qty: 5,
    fulfillmentType: "VS",
    locationId: "loc-003",
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  // Mapped items
  {
    id: "p12",
    sku: "MX-STR-CAM",
    name: "Mima Xari Stroller (Camel)",
    price: 3999.00,
    qty: 10,
    fulfillmentType: "VS",
    locationId: "loc-001",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p13",
    sku: "ST-TTHC-OAK",
    name: "Stokke Tripp Trapp High Chair (Oak)",
    price: 1199.00,
    qty: 15,
    fulfillmentType: "VS",
    locationId: "loc-001",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p14",
    sku: "CC-N2M-CRIB",
    name: "Chicco Next2Me Side Sleeping Crib",
    price: 899.00,
    qty: 8,
    fulfillmentType: "VS",
    locationId: "loc-001",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "p15",
    sku: "NL-GROW-LNG",
    name: "Nuna Leaf Grow Lounger",
    price: 1299.00,
    qty: 12,
    fulfillmentType: "VS",
    locationId: "loc-001",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&h=100&fit=crop",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  }
];

export function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SEED_PRODUCTS;
  }
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  localStorage.setItem("hm_products_sync", Date.now().toString());
}
