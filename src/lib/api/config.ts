/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ERPNext API Configuration                                                   ║
 * ║                                                                              ║
 * ║  This file reads your .env settings and creates the API config.              ║
 * ║  You should NOT need to edit this file — change .env instead.                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * HOW IT WORKS:
 * - Vite automatically reads variables from .env that start with "VITE_"
 * - We access them via import.meta.env.VITE_VARIABLE_NAME
 * - This config object centralizes all API settings in one place
 */

export const apiConfig = {
  /**
   * When true, the app uses built-in dummy data (no API calls).
   * When false, the app makes real API calls to your ERPNext server.
   *
   * Change this in your .env file: VITE_USE_MOCK_DATA=true or false
   */
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== "false",

  /**
   * Your ERPNext server URL (e.g. "https://halamama.erpnext.com")
   * Set in .env: VITE_ERPNEXT_URL=https://your-site.erpnext.com
   */
  baseUrl: (import.meta.env.VITE_ERPNEXT_URL as string) || "",

  /**
   * API Key from ERPNext (User → API Access → Generate Keys)
   * Set in .env: VITE_ERPNEXT_API_KEY=your_key_here
   */
  apiKey: (import.meta.env.VITE_ERPNEXT_API_KEY as string) || "",

  /**
   * API Secret from ERPNext (shown once when you generate keys)
   * Set in .env: VITE_ERPNEXT_API_SECRET=your_secret_here
   */
  apiSecret: (import.meta.env.VITE_ERPNEXT_API_SECRET as string) || "",
};

/**
 * Quick check: Is the API properly configured?
 * Returns true only if we have a URL and both key+secret.
 */
export function isApiConfigured(): boolean {
  return !!(apiConfig.baseUrl && apiConfig.apiKey && apiConfig.apiSecret);
}

/**
 * Are we currently running in demo mode (using mock data)?
 */
export function isDemoMode(): boolean {
  return apiConfig.useMockData || !isApiConfigured();
}
