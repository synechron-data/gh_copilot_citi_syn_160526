import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info')
});

const parsedConfig = configSchema.parse(process.env);

export const config = {
  port: parsedConfig.PORT,
  logLevel: parsedConfig.LOG_LEVEL
} as const;