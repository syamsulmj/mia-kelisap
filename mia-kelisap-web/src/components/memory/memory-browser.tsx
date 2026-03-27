import { MemoryCard } from "./memory-card";
import { MemorySearch } from "./memory-search";
import type { MemoryItem } from "@/types/memory";

export function MemoryBrowser({ memories, onDelete, onSearch }: { memories: MemoryItem[]; onDelete: (id: string) => void; onSearch: (q: string) => void }) {
  return (
    <div className="space-y-6">
      <MemorySearch onSearch={onSearch} />
      {!memories.length ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No memories stored yet. Start a WhatsApp conversation to build your memory.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m) => <MemoryCard key={m.id} memory={m} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
