import { z } from 'zod';
import { TASK_STATUSES, TASK_PRIORITIES } from '../types/task.js';

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'title must be 1-200 characters')
    .max(200, 'title must be 1-200 characters'),
  description: z.string().max(2000, 'description must be at most 2000 characters').default(''),
  status: z.enum(TASK_STATUSES).default('todo'),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'title must be 1-200 characters')
      .max(200, 'title must be 1-200 characters'),
    description: z.string().max(2000, 'description must be at most 2000 characters'),
    status: z.enum(TASK_STATUSES),
    priority: z.enum(TASK_PRIORITIES),
  })
  .partial()
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined,
    { message: 'At least one field must be provided', path: ['body'] },
  );

export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;
export type ListTasksQueryParams = z.infer<typeof listTasksQuerySchema>;
export type TaskIdParams = z.infer<typeof taskIdParamSchema>;
