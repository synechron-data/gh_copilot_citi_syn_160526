import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { TaskController } from '../controllers/task.controller.js';
import { TaskService } from '../services/task.service.js';
import { TaskRepository } from '../repositories/task.repository.js';

const repository = new TaskRepository();
const service = new TaskService(repository);
const controller = new TaskController(service);

export const taskRoutes = Router();

taskRoutes.post('/', asyncHandler(controller.create));
taskRoutes.get('/', asyncHandler(controller.list));
taskRoutes.get('/:id', asyncHandler(controller.getById));
taskRoutes.patch('/:id', asyncHandler(controller.update));
taskRoutes.delete('/:id', asyncHandler(controller.remove));
