export const taskStatuses = ['todo', 'in_progress', 'done'] as const;
export const taskPriorities = ['low', 'medium', 'high'] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface ListTasksInput {
  status?: TaskStatus;
  priority?: TaskPriority;
  limit: number;
  offset: number;
}

export interface ListTasksResult {
  data: Task[];
  total: number;
  limit: number;
  offset: number;
}