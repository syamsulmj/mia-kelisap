import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { MemoryItem } from "@/types/memory";

export function MemoryCard({ memory, onDelete }: { memory: MemoryItem; onDelete: (id: string) => void }) {
  return (
    <Card className="border-border bg-card transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <p className="text-sm leading-relaxed text-foreground">{memory.content.length > 200 ? memory.content.slice(0, 200) + "..." : memory.content}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {memory.metadata.contact_jid && <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">{memory.metadata.contact_jid.split("@")[0]}</span>}
            {memory.metadata.role && <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">{memory.metadata.role}</span>}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(memory.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
