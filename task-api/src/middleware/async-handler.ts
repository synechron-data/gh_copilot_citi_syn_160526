import type { Request, Response, NextFunction, RequestHandler } from 'express';

type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export const asyncHandler = (fn: RouteHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
};
