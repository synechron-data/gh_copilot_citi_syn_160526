import { Router } from 'express';

export function createHealthRoutes(startTime: number): Router {
  const router = Router();

  router.get('/', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  });

  return router;
}