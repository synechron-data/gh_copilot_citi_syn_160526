import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { NotFoundError, ValidationError } from '../errors/domain-errors.js';
import { logger } from '../lib/logger.js';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details: ReadonlyArray<{ path: string; message: string }>;
  };
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    const body: ErrorResponseBody = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details,
      },
    };

    res.status(400).json(body);
    return;
  }

  if (err instanceof ValidationError) {
    const body: ErrorResponseBody = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };

    res.status(400).json(body);
    return;
  }

  if (err instanceof NotFoundError) {
    const body: ErrorResponseBody = {
      error: {
        code: err.code,
        message: err.message,
        details: [],
      },
    };

    res.status(404).json(body);
    return;
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error({ err, stack }, 'Unhandled error');

  const body: ErrorResponseBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message,
      details: [],
    },
  };

  res.status(500).json(body);
};
