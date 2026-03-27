export interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, string>;
}

export interface MemoryListResponse {
  memories: MemoryItem[];
}
