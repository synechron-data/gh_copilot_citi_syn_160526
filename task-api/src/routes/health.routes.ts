import { Router } from 'express';

const startTime = Date.now();

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.status(200).json({ status: 'ok', uptime: uptimeSeconds });
});
