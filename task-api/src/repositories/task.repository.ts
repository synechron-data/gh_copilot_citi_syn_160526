import { randomUUID } from 'node:crypto';

import { NotFoundError } from '../errors/domain-errors.js';
import type { CreateTaskInput, ListTasksInput, ListTasksResult, Task, UpdateTaskInput } from '../types/task.js';

export class TaskRepository {
  readonly #tasks = new Map<string, Task>();

  public create(input: CreateTaskInput): Task {
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.#tasks.set(task.id, task);
    return task;
  }

  public findById(id: string): Task | undefined {
    return this.#tasks.get(id);
  }

  public findAll(input: ListTasksInput): ListTasksResult {
    const filteredTasks = Array.from(this.#tasks.values()).filter((task) => {
      if (input.status && task.status !== input.status) {
        return false;
      }

      if (input.priority && task.priority !== input.priority) {
        return false;
      }

      return true;
    });

    return {
      data: filteredTasks.slice(input.offset, input.offset + input.limit),
      total: filteredTasks.length,
      limit: input.limit,
      offset: input.offset
    };
  }

  public update(id: string, input: UpdateTaskInput): Task {
    const existingTask = this.#tasks.get(id);

    if (!existingTask) {
      throw new NotFoundError('Task not found', { id });
    }

    const updatedTask: Task = {
      ...existingTask,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.#tasks.set(id, updatedTask);
    return updatedTask;
  }

  public delete(id: string): void {
    if (!this.#tasks.has(id)) {
      throw new NotFoundError('Task not found', { id });
    }

    this.#tasks.delete(id);
  }
}