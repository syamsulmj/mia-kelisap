import { logger } from './logger.js';

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delayMs?: number; label?: string } = {},
): Promise<T> {
  const { retries = 3, delayMs = 1000, label = 'operation' } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        logger.error({ error, attempt, label }, `${label} failed after ${retries} attempts`);
        throw error;
      }
      logger.warn({ attempt, label }, `${label} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new Error(`${label} failed after ${retries} attempts`);
}
