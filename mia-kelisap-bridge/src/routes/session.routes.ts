import { Router } from 'express';
import { sessionManager } from '../services/session-manager.js';
import { logger } from '../utils/logger.js';

export const sessionRouter = Router();

sessionRouter.post('/:userId/connect', async (req, res) => {
  const { userId } = req.params;
  try {
    const status = await sessionManager.connect(userId);
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error({ error, userId }, 'Failed to connect');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    });
  }
});

sessionRouter.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  const clearSession = req.query.clear === 'true';
  try {
    await sessionManager.disconnect(userId, clearSession);
    res.json({ success: true, data: { status: 'disconnected' } });
  } catch (error) {
    logger.error({ error, userId }, 'Failed to disconnect');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Disconnect failed',
    });
  }
});

sessionRouter.get('/:userId/status', (req, res) => {
  const { userId } = req.params;
  const status = sessionManager.getStatus(userId);
  res.json({ success: true, data: status });
});

sessionRouter.get('/:userId/qr', (req, res) => {
  const { userId } = req.params;
  const status = sessionManager.getStatus(userId);
  res.json({
    success: true,
    data: { qr_code: status.qrCode ?? null, message: `Status: ${status.status}` },
  });
});
