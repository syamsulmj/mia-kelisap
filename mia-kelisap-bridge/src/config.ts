import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().default(5174),
  API_URL: z.string().default('http://localhost:5172'),
  BRIDGE_SECRET: z.string().min(1, 'BRIDGE_SECRET is required'),
  SESSIONS_DIR: z.string().default('./sessions'),
  LOG_LEVEL: z.string().default('info'),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
