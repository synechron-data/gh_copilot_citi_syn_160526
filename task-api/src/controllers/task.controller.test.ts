import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { TaskController } from './task.controller.js';
import { TaskService } from '../services/task.service.js';
import type { Task, PaginatedResult } from '../types/task.js';

const mockTask: Task = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Test task',
  description: '',
  status: 'todo',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as Request;
}

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as TaskService;

    controller = new TaskController(service);
  });

  describe('create', () => {
    it('returns 201 with created task', () => {
      vi.mocked(service.create).mockReturnValue(mockTask);
      const req = createMockReq({ body: { title: 'Test task' } });
      const res = createMockRes();

      controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('throws on invalid body (Zod)', () => {
      const req = createMockReq({ body: { title: '' } });
      const res = createMockRes();

      expect(() => controller.create(req, res)).toThrow();
    });
  });

  describe('list', () => {
    it('returns 200 with paginated results', () => {
      const paginated: PaginatedResult<Task> = {
        data: [mockTask],
        total: 1,
        limit: 50,
        offset: 0,
      };
      vi.mocked(service.list).mockReturnValue(paginated);
      const req = createMockReq({ query: {} });
      const res = createMockRes();

      controller.list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(paginated);
    });
  });

  describe('getById', () => {
    it('returns 200 with the task', () => {
      vi.mocked(service.findById).mockReturnValue(mockTask);
      const req = createMockReq({ params: { id: mockTask.id } });
      const res = createMockRes();

      controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it('throws NotFoundError for missing task', () => {
      vi.mocked(service.findById).mockReturnValue(undefined);
      const req = createMockReq({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });
      const res = createMockRes();

      expect(() => controller.getById(req, res)).toThrow('not found');
    });

    it('throws on invalid UUID', () => {
      const req = createMockReq({ params: { id: 'not-a-uuid' } });
      const res = createMockRes();

      expect(() => controller.getById(req, res)).toThrow();
    });
  });

  describe('update', () => {
    it('returns 200 with updated task', () => {
      const updatedTask = { ...mockTask, status: 'done' as const };
      vi.mocked(service.update).mockReturnValue(updatedTask);
      const req = createMockReq({
        params: { id: mockTask.id },
        body: { status: 'done' },
      });
      const res = createMockRes();

      controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedTask);
    });

    it('throws on empty body', () => {
      const req = createMockReq({
        params: { id: mockTask.id },
        body: {},
      });
      const res = createMockRes();

      expect(() => controller.update(req, res)).toThrow();
    });
  });

  describe('remove', () => {
    it('returns 204 on successful deletion', () => {
      vi.mocked(service.remove).mockReturnValue(undefined);
      const req = createMockReq({
        params: { id: mockTask.id },
      });
      const res = createMockRes();

      controller.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
