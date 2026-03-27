import { Router } from 'express';
import { z } from 'zod';
import { sessionManager } from '../services/session-manager.js';
import { logger } from '../utils/logger.js';

const sendMessageSchema = z.object({
  userId: z.string().min(1),
  jid: z.string().min(1),
  text: z.string().min(1),
});

export const messageRouter = Router();

messageRouter.post('/send', async (req, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid request body' });
    return;
  }

  const { userId, jid, text } = parsed.data;
  try {
    const sent = await sessionManager.sendMessage(userId, jid, text);
    if (sent) {
      res.json({ success: true, data: { sent: true } });
    } else {
      res.status(400).json({ success: false, error: 'Message not sent — user may not be connected' });
    }
  } catch (error) {
    logger.error({ error, userId, jid }, 'Failed to send message');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Send failed',
    });
  }
});
