import { Router } from 'express';

import { TaskController } from '../controllers/task.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { TaskRepository } from '../repositories/task.repository.js';
import { TaskService } from '../services/task.service.js';

export function createTaskRoutes(): Router {
  const router = Router();
  const taskRepository = new TaskRepository();
  const taskService = new TaskService(taskRepository);
  const taskController = new TaskController(taskService);

  router.post('/', asyncHandler(taskController.create.bind(taskController)));
  router.get('/', asyncHandler(taskController.list.bind(taskController)));
  router.get('/:id', asyncHandler(taskController.getById.bind(taskController)));
  router.patch('/:id', asyncHandler(taskController.update.bind(taskController)));
  router.delete('/:id', asyncHandler(taskController.remove.bind(taskController)));

  return router;
}