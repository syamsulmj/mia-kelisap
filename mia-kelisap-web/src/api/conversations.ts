import { apiClient } from "./client";
import type { ConversationListResponse } from "@/types/conversation";
import type { MessageListResponse } from "@/types/message";

export async function fetchConversations(limit = 50, offset = 0): Promise<ConversationListResponse> {
  const res = await apiClient.get<ConversationListResponse>("/conversations", { params: { limit, offset } });
  return res.data;
}

export async function fetchMessages(conversationId: string): Promise<MessageListResponse> {
  const res = await apiClient.get<MessageListResponse>("/messages", { params: { conversation_id: conversationId } });
  return res.data;
}
