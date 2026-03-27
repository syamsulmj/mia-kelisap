export interface Message {
  id: string;
  content: string;
  role: "incoming" | "outgoing" | "system";
  is_stored_in_memory: boolean;
  created_at: string;
}

export interface MessageListResponse {
  messages: Message[];
}
