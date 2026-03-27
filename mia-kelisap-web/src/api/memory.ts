import { apiClient } from "./client";
import type { MemoryListResponse } from "@/types/memory";

export async function fetchMemories(limit = 50, offset = 0): Promise<MemoryListResponse> {
  const res = await apiClient.get<MemoryListResponse>("/memory", { params: { limit, offset } });
  return res.data;
}

export async function searchMemories(query: string, nResults = 5): Promise<MemoryListResponse> {
  const res = await apiClient.post<MemoryListResponse>("/memory/search", { query, n_results: nResults });
  return res.data;
}

export async function deleteMemory(memoryId: string): Promise<void> {
  await apiClient.delete(`/memory/${memoryId}`);
}
