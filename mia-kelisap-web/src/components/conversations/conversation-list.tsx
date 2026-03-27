import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/conversation";

function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

export function ConversationList({ conversations, selectedId, onSelect }: { conversations: Conversation[]; selectedId?: string; onSelect: (id: string) => void }) {
  if (!conversations.length) return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No conversations yet</div>;

  return (
    <div className="space-y-1 p-2">
      {conversations.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)} className={cn("w-full rounded-md p-3 text-left transition-colors", selectedId === c.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary")}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{c.contact_name}</span>
            <span className="font-mono text-xs text-muted-foreground">{formatRelativeTime(c.created_at)}</span>
          </div>
          {c.last_message && <p className="mt-1 truncate text-xs text-muted-foreground">{c.last_message}</p>}
          <span className="mt-1 inline-block font-mono text-xs text-muted-foreground">{c.message_count} msgs</span>
        </button>
      ))}
    </div>
  );
}
