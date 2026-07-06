/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ERPNext API Configuration — RouteMyOrder                                     ║
 * ║                                                                              ║
 * ║  This file reads your .env settings and creates the API config.              ║
 * ║  You should NOT need to edit this file — change .env instead.                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

export const apiConfig = {
  /**
   * When true, the app uses built-in dummy data (no API calls).
   * When false, the app makes real API calls to your ERPNext server.
   */
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== "false",

  /**
   * Your ERPNext server URL (e.g. "https://halamama.erpnext.com")
   */
  baseUrl: import.meta.env.VITE_ERPNEXT_URL || "",

  /**
   * API Key from ERPNext (User → API Access → Generate Keys)
   */
  apiKey: import.meta.env.VITE_ERPNEXT_API_KEY || "",

  /**
   * API Secret from ERPNext (shown once when you generate keys)
   */
  apiSecret: import.meta.env.VITE_ERPNEXT_API_SECRET || "",
};

export function isApiConfigured() {
  return !!(apiConfig.baseUrl && apiConfig.apiKey && apiConfig.apiSecret);
}

export function isDemoMode() {
  return apiConfig.useMockData || !isApiConfigured();
}
