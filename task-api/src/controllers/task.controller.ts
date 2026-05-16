import type { Request, Response } from 'express';

import { NotFoundError } from '../errors/domain-errors.js';
import {
    createTaskSchema,
    listTasksQuerySchema,
    taskIdParamSchema,
    updateTaskSchema
} from '../schemas/task.schemas.js';
import type { TaskService } from '../services/task.service.js';

export class TaskController {
  public constructor(private readonly taskService: TaskService) {}

  public async create(request: Request, response: Response): Promise<void> {
    const input = createTaskSchema.parse(request.body);
    const task = this.taskService.createTask(input);
    response.status(201).json(task);
  }

  public async list(request: Request, response: Response): Promise<void> {
    const query = listTasksQuerySchema.parse(request.query);
    const result = this.taskService.listTasks(query);
    response.status(200).json(result);
  }

  public async getById(request: Request, response: Response): Promise<void> {
    const { id } = taskIdParamSchema.parse(request.params);
    const task = this.taskService.getTaskById(id);

    if (!task) {
      throw new NotFoundError('Task not found', { id });
    }

    response.status(200).json(task);
  }

  public async update(request: Request, response: Response): Promise<void> {
    const { id } = taskIdParamSchema.parse(request.params);
    const input = updateTaskSchema.parse(request.body);
    const task = this.taskService.updateTask(id, input);
    response.status(200).json(task);
  }

  public async remove(request: Request, response: Response): Promise<void> {
    const { id } = taskIdParamSchema.parse(request.params);
    this.taskService.deleteTask(id);
    response.status(204).send();
  }
}