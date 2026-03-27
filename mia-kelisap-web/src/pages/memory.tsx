import { useState } from "react";
import { RootLayout } from "@/components/layout/root-layout";
import { PageHeader } from "@/components/layout/page-header";
import { MemoryBrowser } from "@/components/memory/memory-browser";
import { useMemories, useSearchMemories, useDeleteMemory } from "@/hooks/use-memory";

export function MemoryPage() {
  const [q, setQ] = useState("");
  const { data: all } = useMemories();
  const { data: searched } = useSearchMemories(q);
  const del = useDeleteMemory();

  return (
    <RootLayout>
      <PageHeader title="Memory" description="Browse and search your stored memories" />
      <div className="animate-fade-up">
        <MemoryBrowser memories={(q ? searched : all)?.memories ?? []} onDelete={(id) => del.mutate(id)} onSearch={setQ} />
      </div>
    </RootLayout>
  );
}
