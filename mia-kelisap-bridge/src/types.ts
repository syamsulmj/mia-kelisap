export interface SessionStatus {
  userId: string;
  status: 'disconnected' | 'connecting' | 'qr_pending' | 'connected';
  qrCode?: string;
  phoneNumber?: string;
}

export interface IncomingMessage {
  userId: string;
  contactJid: string;
  contactName: string;
  content: string;
  timestamp: string;
  isGroup: boolean;
  senderJid?: string;
}

export interface OutgoingMessage {
  userId: string;
  jid: string;
  text: string;
}
