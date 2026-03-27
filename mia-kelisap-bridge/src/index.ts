import express from 'express';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { routes } from './routes/index.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { sessionManager } from './services/session-manager.js';

// Suppress noisy libsignal "Closing session" and "Failed to decrypt" stderr output
const origWrite = process.stderr.write.bind(process.stderr) as (s: string) => boolean;
const filteredWrite = (chunk: string | Uint8Array): boolean => {
  const str = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString();
  if (str.includes('Closing session') || str.includes('Failed to decrypt') || str.includes('SessionEntry')) {
    return true;
  }
  return origWrite(str);
};
process.stderr.write = filteredWrite as unknown as typeof process.stderr.write;

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mia-kelisap-bridge' });
});

app.use(authMiddleware);
app.use(routes);
app.use(errorHandler);

const shutdown = async (): Promise<void> => {
  logger.info('Shutting down...');
  await sessionManager.disconnectAll();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'Mia Kelisap Bridge started');

  // Restore previously authenticated WhatsApp sessions
  void sessionManager.restoreSessions();
});

export { app };
