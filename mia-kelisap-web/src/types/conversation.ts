export interface Conversation {
  id: string;
  contact_jid: string;
  contact_name: string;
  created_at: string;
  last_message: string | null;
  message_count: number;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}
