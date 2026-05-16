import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssueCode } from 'zod';
import { errorHandler } from './error-handler.js';
import { NotFoundError, ValidationError } from '../errors/domain-errors.js';

vi.mock('../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('errorHandler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = createMockRes();
    next = vi.fn();
  });

  it('handles ZodError with 400', () => {
    const zodError = new ZodError([
      {
        code: ZodIssueCode.too_small,
        minimum: 1,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'title must be 1-200 characters',
        path: ['title'],
      },
    ]);

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: [{ path: 'title', message: 'title must be 1-200 characters' }],
      },
    });
  });

  it('handles ValidationError with 400', () => {
    const err = new ValidationError('Bad input', [{ path: 'body', message: 'missing field' }]);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Bad input',
        details: [{ path: 'body', message: 'missing field' }],
      },
    });
  });

  it('handles NotFoundError with 404', () => {
    const err = new NotFoundError('Task not found');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Task not found',
        details: [],
      },
    });
  });

  it('handles unknown errors with 500', () => {
    const err = new Error('Something broke');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something broke',
        details: [],
      },
    });
  });

  it('handles non-Error values with 500', () => {
    errorHandler('string error', req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: [],
      },
    });
  });
});
