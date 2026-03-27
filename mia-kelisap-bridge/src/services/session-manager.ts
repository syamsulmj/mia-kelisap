import fs from 'node:fs';
import path from 'node:path';
import { WhatsAppService } from './whatsapp.service.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';
import type { SessionStatus } from '../types.js';

class SessionManager {
  private sessions: Map<string, WhatsAppService> = new Map();

  getOrCreate(userId: string): WhatsAppService {
    let service = this.sessions.get(userId);
    if (!service) {
      service = new WhatsAppService(userId);
      this.sessions.set(userId, service);
      logger.info({ userId }, 'New WhatsApp service created');
    }
    return service;
  }

  get(userId: string): WhatsAppService | undefined {
    return this.sessions.get(userId);
  }

  async connect(userId: string): Promise<SessionStatus> {
    const service = this.getOrCreate(userId);
    return service.connect();
  }

  async disconnect(userId: string, clearSession = false): Promise<void> {
    const service = this.sessions.get(userId);
    if (service) {
      await service.disconnect();
      if (clearSession) {
        service.clearSession();
        this.sessions.delete(userId);
      }
    }
  }

  getStatus(userId: string): SessionStatus {
    const service = this.sessions.get(userId);
    if (!service) {
      return { userId, status: 'disconnected' };
    }
    return service.getStatus();
  }

  async sendMessage(userId: string, jid: string, text: string): Promise<boolean> {
    const service = this.sessions.get(userId);
    if (!service) {
      logger.warn({ userId }, 'No session found for user');
      return false;
    }
    return service.sendMessage(jid, text);
  }

  async disconnectAll(): Promise<void> {
    for (const [userId, service] of this.sessions) {
      logger.info({ userId }, 'Disconnecting session');
      await service.disconnect();
    }
    this.sessions.clear();
  }

  /**
   * Scan the sessions directory for existing authenticated sessions
   * and reconnect them automatically on server startup.
   */
  async restoreSessions(): Promise<void> {
    const sessionsDir = config.SESSIONS_DIR;
    if (!fs.existsSync(sessionsDir)) return;

    const entries = fs.readdirSync(sessionsDir, { withFileTypes: true });
    const userDirs = entries.filter(
      (e) => e.isDirectory() && e.name !== '.gitkeep',
    );

    if (userDirs.length === 0) {
      logger.info('No existing sessions to restore');
      return;
    }

    logger.info({ count: userDirs.length }, 'Restoring WhatsApp sessions');

    for (const dir of userDirs) {
      const userId = dir.name;
      const credsPath = path.join(sessionsDir, userId, 'creds.json');

      if (!fs.existsSync(credsPath)) {
        logger.info({ userId }, 'Skipping — no creds.json found');
        continue;
      }

      try {
        logger.info({ userId }, 'Restoring session');
        await this.connect(userId);
      } catch (error) {
        logger.error({ error, userId }, 'Failed to restore session');
      }
    }
  }
}

export const sessionManager = new SessionManager();
