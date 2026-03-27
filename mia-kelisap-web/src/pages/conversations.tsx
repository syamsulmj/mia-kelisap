import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ConversationDetail } from "@/components/conversations/conversation-detail";
import { useConversations, useMessages } from "@/hooks/use-conversations";
import { Card } from "@/components/ui/card";

export function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: convData } = useConversations();
  const { data: msgData } = useMessages(selectedId ?? "");
  const sel = convData?.conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 pt-16 pb-4 lg:px-8 lg:pt-8">
          <h1 className="text-2xl font-semibold text-foreground">Conversations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your WhatsApp chat history</p>
        </div>
        {/* Chat grid — fills remaining height */}
        <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-4 px-6 pb-6 lg:px-8 lg:pb-8">
          <Card className="flex w-80 shrink-0 flex-col border-border bg-card">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ConversationList conversations={convData?.conversations ?? []} selectedId={selectedId ?? undefined} onSelect={setSelectedId} />
            </div>
          </Card>
          <Card className="flex min-h-0 flex-1 flex-col border-border bg-card">
            {sel && msgData ? (
              <ConversationDetail messages={msgData.messages} contactName={sel.contact_name} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Select a conversation to view messages</div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
