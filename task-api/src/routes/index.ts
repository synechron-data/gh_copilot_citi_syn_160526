import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { taskRoutes } from './task.routes.js';

export const routes = Router();

routes.use('/health', healthRoutes);
routes.use('/tasks', taskRoutes);
