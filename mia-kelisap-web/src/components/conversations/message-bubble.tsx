import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";
import type { Message } from "@/types/message";

export function MessageBubble({ message }: { message: Message }) {
  const isOut = message.role === "outgoing";
  const time = new Date(message.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] rounded-lg px-4 py-2.5", isOut ? "bg-primary/15 text-foreground" : "bg-secondary text-foreground")}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">{time}</span>
          {message.is_stored_in_memory && <Brain size={10} className="text-primary" />}
        </div>
      </div>
    </div>
  );
}
