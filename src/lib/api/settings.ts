import { isDemoMode } from "./config";
import { erpNextClient } from "./client";

export interface RejectionReason {
  id: string;
  text: string;
  type: "driver" | "outlet" | "both";
  sortOrder: number;
}

const STORAGE_KEY = "hm_rejection_reasons";

const DEFAULT_REASONS: RejectionReason[] = [
  { id: "1", text: "Other", type: "both", sortOrder: 9999 },
  { id: "2", text: "Customer not available", type: "driver", sortOrder: 100 },
  { id: "3", text: "Wrong address", type: "driver", sortOrder: 200 },
  { id: "4", text: "Item damaged", type: "outlet", sortOrder: 300 },
  { id: "5", text: "Out of stock", type: "outlet", sortOrder: 400 },
];

function getMockReasons(): RejectionReason[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_REASONS;
}

function saveMockReasons(reasons: RejectionReason[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reasons));
}

export async function fetchRejectionReasons(): Promise<RejectionReason[]> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 200));
    return getMockReasons();
  }

  const response = await erpNextClient.get<{ data: any[] }>("/api/resource/Rejection Reason", {
    fields: JSON.stringify(["name", "reason_text", "type", "sort_order"]),
    limit_page_length: "0",
  });

  return response.data.map((r) => ({
    id: r.name,
    text: r.reason_text || "",
    type: r.type?.toLowerCase() || "both",
    sortOrder: r.sort_order || 500,
  }));
}

export async function createRejectionReason(data: Omit<RejectionReason, "id">): Promise<RejectionReason> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 200));
    const reasons = getMockReasons();
    const newReason = { ...data, id: `r${Date.now()}` };
    saveMockReasons([...reasons, newReason]);
    return newReason;
  }

  const response = await erpNextClient.post<{ data: any }>("/api/resource/Rejection Reason", {
    reason_text: data.text,
    type: data.type.charAt(0).toUpperCase() + data.type.slice(1), // Capitalize
    sort_order: data.sortOrder,
  });

  return {
    id: response.data.name,
    text: response.data.reason_text || "",
    type: response.data.type?.toLowerCase() || "both",
    sortOrder: response.data.sort_order || 500,
  };
}

export async function updateRejectionReason(id: string, data: Partial<RejectionReason>): Promise<RejectionReason> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 200));
    const reasons = getMockReasons();
    const index = reasons.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...reasons[index], ...data };
    reasons[index] = updated;
    saveMockReasons(reasons);
    return updated;
  }

  const payload: any = {};
  if (data.text !== undefined) payload.reason_text = data.text;
  if (data.type !== undefined) payload.type = data.type.charAt(0).toUpperCase() + data.type.slice(1);
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;

  const response = await erpNextClient.put<{ data: any }>(`/api/resource/Rejection Reason/${id}`, payload);

  return {
    id: response.data.name,
    text: response.data.reason_text || "",
    type: response.data.type?.toLowerCase() || "both",
    sortOrder: response.data.sort_order || 500,
  };
}

export async function deleteRejectionReason(id: string): Promise<void> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 200));
    const reasons = getMockReasons();
    saveMockReasons(reasons.filter((r) => r.id !== id));
    return;
  }

  await erpNextClient.delete(`/api/resource/Rejection Reason/${id}`);
}

export const settingsApi = {
  fetchRejectionReasons,
  createRejectionReason,
  updateRejectionReason,
  deleteRejectionReason,
};
