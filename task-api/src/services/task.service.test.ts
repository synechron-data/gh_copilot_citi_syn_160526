import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from './task.service.js';
import { TaskRepository } from '../repositories/task.repository.js';
import { NotFoundError } from '../errors/domain-errors.js';
import type { Task, PaginatedResult } from '../types/task.js';

const mockTask: Task = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Test task',
  description: 'Description',
  status: 'todo',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TaskService', () => {
  let service: TaskService;
  let repository: TaskRepository;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as TaskRepository;

    service = new TaskService(repository);
  });

  describe('create', () => {
    it('delegates to repository and returns the created task', () => {
      vi.mocked(repository.create).mockReturnValue(mockTask);

      const result = service.create({ title: 'Test task' });

      expect(repository.create).toHaveBeenCalledWith({ title: 'Test task' });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findById', () => {
    it('returns the task when found', () => {
      vi.mocked(repository.findById).mockReturnValue(mockTask);

      const result = service.findById(mockTask.id);

      expect(repository.findById).toHaveBeenCalledWith(mockTask.id);
      expect(result).toEqual(mockTask);
    });

    it('returns undefined when not found', () => {
      vi.mocked(repository.findById).mockReturnValue(undefined);

      const result = service.findById('nonexistent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('delegates to repository with query params', () => {
      const paginatedResult: PaginatedResult<Task> = {
        data: [mockTask],
        total: 1,
        limit: 50,
        offset: 0,
      };
      vi.mocked(repository.findAll).mockReturnValue(paginatedResult);

      const query = { limit: 50, offset: 0 };
      const result = service.list(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResult);
    });

    it('passes status and priority filters', () => {
      const paginatedResult: PaginatedResult<Task> = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
      vi.mocked(repository.findAll).mockReturnValue(paginatedResult);

      const query = { status: 'done' as const, priority: 'high' as const, limit: 10, offset: 0 };
      service.list(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('returns the updated task when found', () => {
      const updatedTask = { ...mockTask, title: 'Updated', updatedAt: '2026-01-02T00:00:00.000Z' };
      vi.mocked(repository.update).mockReturnValue(updatedTask);

      const result = service.update(mockTask.id, { title: 'Updated' });

      expect(repository.update).toHaveBeenCalledWith(mockTask.id, { title: 'Updated' });
      expect(result).toEqual(updatedTask);
    });

    it('throws NotFoundError when task does not exist', () => {
      vi.mocked(repository.update).mockReturnValue(undefined);

      expect(() => service.update('nonexistent-id', { title: 'Nope' })).toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('deletes the task when found', () => {
      vi.mocked(repository.delete).mockReturnValue(true);

      expect(() => service.remove(mockTask.id)).not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(mockTask.id);
    });

    it('throws NotFoundError when task does not exist', () => {
      vi.mocked(repository.delete).mockReturnValue(false);

      expect(() => service.remove('nonexistent-id')).toThrow(NotFoundError);
    });
  });
});
