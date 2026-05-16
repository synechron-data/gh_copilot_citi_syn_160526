import type { NextFunction, Request, Response } from 'express';

import { logger } from '../lib/logger.js';

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startTime = process.hrtime.bigint();

  response.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    logger.info(
      {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Number(durationMs.toFixed(2))
      },
      'HTTP request completed'
    );
  });

  next();
}