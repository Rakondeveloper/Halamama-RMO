/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ERPNext API Client — RouteMyOrder                                            ║
 * ║                                                                              ║
 * ║  A robust, fetch-based REST client that automatically handles:               ║
 * ║  • Appending the token-based Authorization headers                           ║
 * ║  • Formatting endpoints and building clean URLs                             ║
 * ║  • Parsing and handling HTTP response errors                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { apiConfig } from "./config";

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiConfig.apiKey && apiConfig.apiSecret) {
    headers["Authorization"] = `token ${apiConfig.apiKey}:${apiConfig.apiSecret}`;
  }

  return headers;
}

function buildUrl(endpoint, params) {
  const base = apiConfig.baseUrl.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${base}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

async function request(endpoint, options = {}, params = null) {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      `ERPNext API Error (${response.status}): ${response.statusText}`,
      errorBody,
    );
  }

  return response.json();
}

export const erpNextClient = {
  get: (endpoint, params = null) => request(endpoint, { method: "GET" }, params),
  post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
