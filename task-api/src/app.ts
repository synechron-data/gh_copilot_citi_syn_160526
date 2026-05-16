import express from 'express';
import { routes } from './routes/index.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);
  app.use(routes);
  app.use(errorHandler);

  return app;
}
