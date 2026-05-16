import { NotFoundError } from '../errors/domain-errors.js';
import { TaskRepository } from '../repositories/task.repository.js';
import type { CreateTaskInput, UpdateTaskInput, ListTasksQuery, Task, PaginatedResult } from '../types/task.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  create(input: CreateTaskInput): Task {
    return this.repository.create(input);
  }

  findById(id: string): Task | undefined {
    return this.repository.findById(id);
  }

  list(query: ListTasksQuery): PaginatedResult<Task> {
    return this.repository.findAll(query);
  }

  update(id: string, input: UpdateTaskInput): Task {
    const updated = this.repository.update(id, input);
    if (!updated) {
      throw new NotFoundError(`Task with id '${id}' not found`);
    }
    return updated;
  }

  remove(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with id '${id}' not found`);
    }
  }
}
