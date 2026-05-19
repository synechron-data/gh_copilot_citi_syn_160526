import type { Request, Response } from 'express';
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema, taskIdParamSchema } from '../schemas/task.schemas.js';
import { TaskService } from '../services/task.service.js';
import { NotFoundError } from '../errors/domain-errors.js';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  create = (req: Request, res: Response): void => {
    const body = createTaskSchema.parse(req.body);
    const task = this.service.create(body);
    res.status(201).json(task);
  };

  list = (req: Request, res: Response): void => {
    const query = listTasksQuerySchema.parse(req.query);
    const result = this.service.list(query);
    res.status(200).json(result);
  };

  getById = (req: Request, res: Response): void => {
    const { id } = taskIdParamSchema.parse(req.params);
    const task = this.service.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with id '${id}' not found`);
    }
    res.status(200).json(task);
  };

  update = (req: Request, res: Response): void => {
    const { id } = taskIdParamSchema.parse(req.params);
    const body = updateTaskSchema.parse(req.body);
    const task = this.service.update(id, body);
    res.status(200).json(task);
  };

  remove = (req: Request, res: Response): void => {
    const { id } = taskIdParamSchema.parse(req.params);
    this.service.remove(id);
    res.status(204).send();
  };
}
