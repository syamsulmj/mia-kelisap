import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import type { IncomingMessage } from '../types.js';

export class ApiClient {
  private baseUrl: string;
  private secret: string;

  constructor() {
    this.baseUrl = config.API_URL;
    this.secret = config.BRIDGE_SECRET;
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.secret}`,
    };
  }

  async postIncomingMessage(message: IncomingMessage): Promise<void> {
    await withRetry(
      async () => {
        const url = `${this.baseUrl}/api/v1/messages/incoming`;
        const response = await fetch(url, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            user_id: message.userId,
            contact_jid: message.contactJid,
            contact_name: message.contactName,
            content: message.content,
            timestamp: message.timestamp,
            is_group: message.isGroup,
            sender_jid: message.senderJid,
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`API responded with ${response.status}: ${body}`);
        }

        logger.info({ contactJid: message.contactJid }, 'Message forwarded to API');
      },
      { label: 'postIncomingMessage', retries: 3, delayMs: 2000 },
    );
  }

  async notifyConnectionStatus(userId: string, status: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/v1/whatsapp/bridge-status`;
      await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ user_id: userId, status }),
      });
      logger.info({ userId, status }, 'Connection status notified to API');
    } catch (error) {
      logger.warn({ error, userId }, 'Failed to notify connection status');
    }
  }
}

export const apiClient = new ApiClient();
