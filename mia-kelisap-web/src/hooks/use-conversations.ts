import { useQuery } from "@tanstack/react-query";
import { fetchConversations, fetchMessages } from "@/api/conversations";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: () => fetchConversations() });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    enabled: !!conversationId,
  });
}
