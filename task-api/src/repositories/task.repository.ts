import { randomUUID } from 'node:crypto';
import type { Task, CreateTaskInput, UpdateTaskInput, ListTasksQuery, PaginatedResult } from '../types/task.js';

export class TaskRepository {
  private readonly store = new Map<string, Task>();

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(task.id, task);
    return task;
  }

  findById(id: string): Task | undefined {
    return this.store.get(id);
  }

  findAll(query: ListTasksQuery): PaginatedResult<Task> {
    let tasks = Array.from(this.store.values());

    if (query.status) {
      tasks = tasks.filter((t) => t.status === query.status);
    }

    if (query.priority) {
      tasks = tasks.filter((t) => t.priority === query.priority);
    }

    const total = tasks.length;
    const data = tasks.slice(query.offset, query.offset + query.limit);

    return { data, total, limit: query.limit, offset: query.offset };
  }

  update(id: string, input: UpdateTaskInput): Task | undefined {
    const existing = this.store.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }
}
