import express, { type Express } from 'express';

import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { registerRoutes } from './routes/index.js';

export function createApp(startTime = Date.now()): Express {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);

  registerRoutes(app, startTime);

  app.use(errorHandler);

  return app;
}