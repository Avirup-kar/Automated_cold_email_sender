import type { ConnectionOptions } from 'bullmq';

export function getRedisConnection(): ConnectionOptions {
  const port = Number(process.env.REDIS_PORT ?? 6379);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('REDIS_PORT must be a positive integer');
  }

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port,
    ...(process.env.REDIS_PASSWORD
      ? { password: process.env.REDIS_PASSWORD }
      : {}),
    ...(process.env.REDIS_TLS === 'true' ? { tls: {} } : {}),
  };
}
