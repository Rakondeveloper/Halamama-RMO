/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Module — Barrel Export                                                  ║
 * ║                                                                              ║
 * ║  This file re-exports everything from the api/ folder so you can             ║
 * ║  import from a single clean path:                                            ║
 * ║                                                                              ║
 * ║    import { ordersApi, isDemoMode } from "@/lib/api";                        ║
 * ║                                                                              ║
 * ║  Instead of importing from individual files:                                 ║
 * ║    import { ordersApi } from "@/lib/api/services";                           ║
 * ║    import { isDemoMode } from "@/lib/api/config";                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// Configuration & status checks
export { apiConfig, isApiConfigured, isDemoMode } from "./config";

// The HTTP client (rarely needed directly, but available)
export { erpNextClient, ApiError } from "./client";

// Data mappers (rarely needed directly, but available for custom endpoints)
export {
  mapErpNextToOrder,
  mapErpNextToEnrichedOrder,
  mapErpNextToOrderItem,
} from "./mappers";

// ★ Main API services — this is what you'll use most ★
export { ordersApi } from "./services";
export { settingsApi } from "./settings";
