import { z } from 'zod';

import { taskPriorities, taskStatuses } from '../types/task.js';

export const taskIdParamSchema = z.object({
  id: z.string().uuid()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided'
});

export const listTasksQuerySchema = z.object({
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;