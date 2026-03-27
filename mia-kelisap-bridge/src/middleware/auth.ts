import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${config.BRIDGE_SECRET}`) {
    logger.warn({ path: req.path, ip: req.ip }, 'Unauthorized request');
    res.status(403).json({ success: false, error: 'Forbidden: Invalid bridge secret' });
    return;
  }

  next();
}
