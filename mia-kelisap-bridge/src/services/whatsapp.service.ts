import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  type WASocket,
  type BaileysEventMap,
  type proto,
} from '@whiskeysockets/baileys';
import path from 'node:path';
import fs from 'node:fs';
import QRCode from 'qrcode';
import pino from 'pino';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { apiClient } from './api-client.js';
import type { SessionStatus } from '../types.js';

const baileysLogger = pino({ level: 'silent' });

export class WhatsAppService {
  private userId: string;
  private socket: WASocket | null = null;
  private qrCode: string | null = null;
  private status: SessionStatus['status'] = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private intentionalDisconnect = false;
  private botNumber: string | null = null;
  private botLid: string | null = null;
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  /** In-memory message store for retry handling — keyed by message ID */
  private messageStore: Map<string, proto.IMessage> = new Map();
  private readonly MAX_STORE_SIZE = 500;
  /** Track if we've received any message event since connecting */
  private hasReceivedMessages = false;
  private livenessTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /** Store a message for retry retrieval. Evicts oldest if over limit. */
  private storeMessage(id: string, message: proto.IMessage): void {
    this.messageStore.set(id, message);
    if (this.messageStore.size > this.MAX_STORE_SIZE) {
      const oldest = this.messageStore.keys().next().value;
      if (oldest) this.messageStore.delete(oldest);
    }
  }

  get sessionDir(): string {
    return path.join(config.SESSIONS_DIR, this.userId);
  }

  getStatus(): SessionStatus {
    return {
      userId: this.userId,
      status: this.status,
      qrCode: this.qrCode ?? undefined,
      phoneNumber: this.botNumber ?? undefined,
    };
  }

  async connect(): Promise<SessionStatus> {
    if (this.status === 'connected' && this.socket) {
      return this.getStatus();
    }

    this.intentionalDisconnect = false;
    this.hasReceivedMessages = false;
    this.status = 'connecting';
    logger.info({ userId: this.userId }, 'Initiating WhatsApp connection');

    // On reconnect attempts (not first connect), clear stale Signal sessions
    // This forces fresh encryption negotiation with contacts
    if (this.reconnectAttempts > 0) {
      this.clearSignalSessions();
    }

    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

    const { version } = await fetchLatestBaileysVersion();
    logger.info({ version }, 'Using WA Web version');

    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          baileysLogger as Parameters<typeof makeCacheableSignalKeyStore>[1],
        ),
      },
      version,
      printQRInTerminal: false,
      logger: baileysLogger as Parameters<typeof makeWASocket>[0]['logger'],
      browser: Browsers.macOS('Chrome'),
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 30_000,
      getMessage: async (key) => {
        const id = key.id;
        if (id && this.messageStore.has(id)) {
          return this.messageStore.get(id);
        }
        return undefined;
      },
    });

    this.socket = sock;

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
      void this.handleConnectionUpdate(update);
    });
    sock.ev.on('messages.upsert', (upsert) => {
      this.hasReceivedMessages = true;
      // Store all messages for retry handling
      for (const msg of upsert.messages) {
        if (msg.key.id && msg.message) {
          this.storeMessage(msg.key.id, msg.message);
        }
      }
      void this.handleMessagesUpsert(upsert);
    });

    return this.getStatus();
  }

  private async handleConnectionUpdate(
    update: Partial<BaileysEventMap['connection.update']>,
  ): Promise<void> {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.status = 'qr_pending';
      try {
        this.qrCode = await QRCode.toDataURL(qr);
        logger.info({ userId: this.userId }, 'QR code generated');
      } catch (err) {
        logger.error({ err }, 'Failed to generate QR code');
      }
    }

    if (connection === 'close') {
      this.qrCode = null;
      this.stopHealthCheck();
      this.stopLivenessCheck();
      const statusCode = (
        lastDisconnect?.error as { output?: { statusCode?: number } }
      )?.output?.statusCode;

      logger.info(
        { userId: this.userId, statusCode, intentional: this.intentionalDisconnect },
        'Connection closed',
      );

      if (this.intentionalDisconnect) {
        this.status = 'disconnected';
        this.socket = null;
        this.reconnectAttempts = 0;
        return;
      }

      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut &&
        statusCode !== DisconnectReason.forbidden;

      if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        logger.info(
          { userId: this.userId, attempt: this.reconnectAttempts, delay },
          'Reconnecting...',
        );
        setTimeout(() => void this.connect(), delay);
      } else {
        this.status = 'disconnected';
        this.socket = null;
        if (
          statusCode === DisconnectReason.loggedOut ||
          statusCode === DisconnectReason.badSession
        ) {
          this.clearSession();
        }
        await apiClient.notifyConnectionStatus(this.userId, 'disconnected');
      }
    }

    if (connection === 'open') {
      this.status = 'connected';
      this.qrCode = null;
      this.reconnectAttempts = 0;

      // Extract bot's phone number and LID for mention matching
      const rawId = this.socket?.user?.id ?? null;
      this.botNumber = rawId?.split(':')[0]?.split('@')[0] ?? null;

      const userObj = this.socket?.user as unknown as Record<string, unknown> | undefined;
      const lid = userObj?.lid as string | undefined;
      this.botLid = lid?.split(':')[0]?.split('@')[0] ?? null;

      logger.info(
        { userId: this.userId, botNumber: this.botNumber, botLid: this.botLid },
        'WhatsApp connected',
      );
      this.startHealthCheck();
      this.startLivenessCheck();
      await apiClient.notifyConnectionStatus(this.userId, 'connected');
    }
  }

  /**
   * Extract the numeric identifier from any JID format.
   * Handles: "60123@s.whatsapp.net", "60123:0@s.whatsapp.net", "12345@lid"
   */
  private static extractJidNumber(jid: string): string | undefined {
    return jid.split(':')[0]?.split('@')[0];
  }

  /**
   * Get contextInfo from ANY message type — not just extendedTextMessage.
   * WhatsApp puts contextInfo in different places depending on message type.
   */
  private static getContextInfo(
    msg: BaileysEventMap['messages.upsert']['messages'][0],
  ): proto.IContextInfo | null | undefined {
    const m = msg.message;
    return (
      m?.extendedTextMessage?.contextInfo ??
      m?.imageMessage?.contextInfo ??
      m?.videoMessage?.contextInfo ??
      m?.documentMessage?.contextInfo ??
      m?.audioMessage?.contextInfo ??
      m?.stickerMessage?.contextInfo ??
      null
    );
  }

  /**
   * Check if the bot is mentioned in a group message.
   * Layers:
   * 1. mentionedJid array — phone number match
   * 2. mentionedJid array — LID match
   * 3. Quoted message reply — someone replied to bot's message
   * 4. Fallback — bot's phone number appears in text
   */
  private isBotMentioned(msg: BaileysEventMap['messages.upsert']['messages'][0]): boolean {
    // Re-extract bot number from live socket (not cached) for reliability
    const botNumber = this.socket?.user?.id
      ? WhatsAppService.extractJidNumber(this.socket.user.id)
      : this.botNumber;
    if (!botNumber) return false;

    const contextInfo = WhatsAppService.getContextInfo(msg);
    const mentionedJids: string[] = (contextInfo?.mentionedJid as string[] | undefined) ?? [];

    // Layer 1: Phone number match in mentionedJid
    const mentionedByPhone = mentionedJids.some((jid) => {
      return WhatsAppService.extractJidNumber(jid) === botNumber;
    });
    if (mentionedByPhone) return true;

    // Layer 2: LID match in mentionedJid
    const botLid = this.botLid;
    if (botLid) {
      const mentionedByLid = mentionedJids.some((jid) => {
        return WhatsAppService.extractJidNumber(jid) === botLid;
      });
      if (mentionedByLid) return true;
    }

    // Layer 3: Someone replied to bot's message (quotedMessage participant)
    const quotedParticipant = contextInfo?.participant;
    if (quotedParticipant) {
      const quotedNumber = WhatsAppService.extractJidNumber(quotedParticipant);
      if (quotedNumber === botNumber || quotedNumber === botLid) {
        return true;
      }
    }

    // Layer 4: Fallback — phone number appears in message text
    const msgText =
      msg.message?.conversation ??
      msg.message?.extendedTextMessage?.text ?? '';
    if (botNumber && msgText.includes(botNumber)) return true;

    return false;
  }

  private async handleMessagesUpsert(
    upsert: BaileysEventMap['messages.upsert'],
  ): Promise<void> {
    const { messages, type } = upsert;
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.key?.remoteJid) continue;
      if (msg.key.fromMe) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;

      const isGroup = msg.key.remoteJid.endsWith('@g.us');

      // Group messages: only process if bot is @mentioned or replied to
      if (isGroup) {
        const ctxInfo = WhatsAppService.getContextInfo(msg);
        logger.info(
          {
            userId: this.userId,
            group: msg.key.remoteJid,
            botNumber: this.botNumber,
            botLid: this.botLid,
            mentionedJid: (ctxInfo?.mentionedJid as string[] | undefined) ?? [],
            quotedParticipant: ctxInfo?.participant ?? null,
          },
          'Group message — checking mention',
        );

        if (!this.isBotMentioned(msg)) {
          continue;
        }
        logger.info(
          { userId: this.userId, group: msg.key.remoteJid },
          'Bot mentioned in group',
        );
      }

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption;

      if (!text) continue;

      // For groups, sender is msg.key.participant; for DMs it's remoteJid
      const senderJid = isGroup
        ? (msg.key.participant ?? msg.key.remoteJid)
        : msg.key.remoteJid;

      const contactJid = msg.key.remoteJid;
      const contactName = msg.pushName || senderJid.split(':')[0]?.split('@')[0] || 'Unknown';
      const timestamp = msg.messageTimestamp
        ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
        : new Date().toISOString();

      logger.info(
        { userId: this.userId, contactJid, contactName, isGroup, senderJid },
        'Incoming message',
      );

      await apiClient.postIncomingMessage({
        userId: this.userId,
        contactJid,
        contactName,
        content: text,
        timestamp,
        isGroup,
        senderJid,
      });
    }
  }

  async sendMessage(jid: string, text: string): Promise<boolean> {
    if (!this.socket || this.status !== 'connected') {
      logger.warn({ userId: this.userId, jid }, 'Cannot send: not connected');
      return false;
    }

    try {
      const sent = await this.socket.sendMessage(jid, { text });
      // Store outgoing message for retry handling
      if (sent?.key?.id && sent.message) {
        this.storeMessage(sent.key.id, sent.message);
      }
      logger.info({ userId: this.userId, jid }, 'Message sent');
      return true;
    } catch (error) {
      logger.error({ error, userId: this.userId, jid }, 'Failed to send message');
      return false;
    }
  }

  /**
   * After connecting, wait 2 minutes. If no messages.upsert event has fired,
   * the session is "connected but deaf" — clear Signal sessions and reconnect.
   */
  private startLivenessCheck(): void {
    this.stopLivenessCheck();
    this.livenessTimer = setTimeout(() => {
      if (this.status === 'connected' && !this.hasReceivedMessages) {
        logger.warn(
          { userId: this.userId },
          'No messages received after 2min — session is deaf, clearing Signal sessions and reconnecting',
        );
        this.stopHealthCheck();
        if (this.socket) {
          this.socket.end(undefined);
          this.socket = null;
        }
        this.status = 'disconnected';
        this.clearSignalSessions();
        this.reconnectAttempts = 0;
        void this.connect();
      }
    }, 120_000); // 2 minutes
  }

  private stopLivenessCheck(): void {
    if (this.livenessTimer) {
      clearTimeout(this.livenessTimer);
      this.livenessTimer = null;
    }
  }

  /**
   * Periodically check if the WebSocket is still alive.
   * Baileys sometimes silently loses the connection without firing
   * connection.update — this catches those cases and force-reconnects.
   */
  private startHealthCheck(): void {
    this.stopHealthCheck();
    this.healthCheckTimer = setInterval(() => {
      if (this.status !== 'connected' || !this.socket) return;

      // Check if the socket's underlying WS is still open
      const ws = (this.socket as unknown as { ws?: { readyState?: number } })?.ws;
      if (ws && ws.readyState !== undefined && ws.readyState !== 1) {
        logger.warn(
          { userId: this.userId, readyState: ws.readyState },
          'WebSocket stale — forcing reconnect',
        );
        this.socket.end(undefined);
        this.socket = null;
        this.status = 'disconnected';
        this.stopHealthCheck();
        void this.connect();
        return;
      }

      // Also try to read connection state as a liveness probe
      try {
        const user = this.socket.user;
        if (!user) {
          logger.warn({ userId: this.userId }, 'Socket user is null — forcing reconnect');
          this.socket.end(undefined);
          this.socket = null;
          this.status = 'disconnected';
          this.stopHealthCheck();
          void this.connect();
        }
      } catch {
        logger.warn({ userId: this.userId }, 'Health check failed — forcing reconnect');
        this.socket = null;
        this.status = 'disconnected';
        this.stopHealthCheck();
        void this.connect();
      }
    }, 60_000); // Check every 60 seconds
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  async disconnect(): Promise<void> {
    this.intentionalDisconnect = true;
    this.stopHealthCheck();
    this.stopLivenessCheck();
    if (this.socket) {
      this.socket.end(undefined);
      this.socket = null;
    }
    this.status = 'disconnected';
    this.qrCode = null;
    this.reconnectAttempts = 0;
    logger.info({ userId: this.userId }, 'Intentionally disconnected');
    await apiClient.notifyConnectionStatus(this.userId, 'disconnected');
  }

  /**
   * Clear stale Signal session files while preserving auth credentials.
   * This forces Baileys to renegotiate encryption with contacts
   * without requiring a new QR scan.
   */
  clearSignalSessions(): void {
    if (!fs.existsSync(this.sessionDir)) return;

    const files = fs.readdirSync(this.sessionDir);
    let cleared = 0;
    for (const file of files) {
      // Remove session-*.json and sender-key-*.json (Signal encryption state)
      // Keep creds.json (WhatsApp auth), pre-key-*.json, and app-state-*.json
      if (file.startsWith('session-') || file.startsWith('sender-key-')) {
        fs.unlinkSync(path.join(this.sessionDir, file));
        cleared++;
      }
    }
    if (cleared > 0) {
      logger.info(
        { userId: this.userId, cleared },
        'Cleared stale Signal session files',
      );
    }
  }

  clearSession(): void {
    if (fs.existsSync(this.sessionDir)) {
      fs.rmSync(this.sessionDir, { recursive: true, force: true });
      logger.info({ userId: this.userId }, 'Session data cleared');
    }
  }
}
