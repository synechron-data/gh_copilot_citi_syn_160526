import type { TaskRepository } from '../repositories/task.repository.js';
import type { CreateTaskInput, ListTasksInput, ListTasksResult, Task, UpdateTaskInput } from '../types/task.js';

export class TaskService {
  public constructor(private readonly taskRepository: TaskRepository) {}

  public createTask(input: CreateTaskInput): Task {
    return this.taskRepository.create(input);
  }

  public listTasks(input: ListTasksInput): ListTasksResult {
    return this.taskRepository.findAll(input);
  }

  public getTaskById(id: string): Task | undefined {
    return this.taskRepository.findById(id);
  }

  public updateTask(id: string, input: UpdateTaskInput): Task {
    return this.taskRepository.update(id, input);
  }

  public deleteTask(id: string): void {
    this.taskRepository.delete(id);
  }
}