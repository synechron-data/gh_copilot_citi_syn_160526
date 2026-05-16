import type { Express } from 'express';

import { createHealthRoutes } from './health.routes.js';
import { createTaskRoutes } from './task.routes.js';

export function registerRoutes(app: Express, startTime: number): void {
  app.use('/health', createHealthRoutes(startTime));
  app.use('/tasks', createTaskRoutes());
}