import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { Message } from "@/types/message";

export function ConversationDetail({ messages, contactName }: { messages: Message[]; contactName: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border px-6 py-4">
        <h2 className="text-lg font-medium text-foreground">{contactName}</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
