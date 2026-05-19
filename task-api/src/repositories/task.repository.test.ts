import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRepository } from './task.repository.js';

describe('TaskRepository', () => {
  let repo: TaskRepository;

  beforeEach(() => {
    repo = new TaskRepository();
  });

  describe('create', () => {
    it('creates a task with all fields', () => {
      const task = repo.create({
        title: 'Test task',
        description: 'A description',
        status: 'in_progress',
        priority: 'high',
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test task');
      expect(task.description).toBe('A description');
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.createdAt).toBe(task.updatedAt);
    });

    it('applies defaults for optional fields', () => {
      const task = repo.create({ title: 'Minimal task' });

      expect(task.description).toBe('');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
    });

    it('generates a unique UUID for each task', () => {
      const t1 = repo.create({ title: 'One' });
      const t2 = repo.create({ title: 'Two' });

      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('findById', () => {
    it('returns the task when it exists', () => {
      const created = repo.create({ title: 'Find me' });
      const found = repo.findById(created.id);

      expect(found).toEqual(created);
    });

    it('returns undefined for a non-existent id', () => {
      const found = repo.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('returns all tasks with default pagination', () => {
      repo.create({ title: 'Task 1' });
      repo.create({ title: 'Task 2' });

      const result = repo.findAll({ limit: 50, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('filters by status', () => {
      repo.create({ title: 'Todo', status: 'todo' });
      repo.create({ title: 'Done', status: 'done' });

      const result = repo.findAll({ status: 'done', limit: 50, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.title).toBe('Done');
      expect(result.total).toBe(1);
    });

    it('filters by priority', () => {
      repo.create({ title: 'High', priority: 'high' });
      repo.create({ title: 'Low', priority: 'low' });

      const result = repo.findAll({ priority: 'high', limit: 50, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.title).toBe('High');
    });

    it('filters by both status and priority', () => {
      repo.create({ title: 'A', status: 'todo', priority: 'high' });
      repo.create({ title: 'B', status: 'done', priority: 'high' });
      repo.create({ title: 'C', status: 'todo', priority: 'low' });

      const result = repo.findAll({ status: 'todo', priority: 'high', limit: 50, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.title).toBe('A');
    });

    it('respects limit', () => {
      repo.create({ title: 'Task 1' });
      repo.create({ title: 'Task 2' });
      repo.create({ title: 'Task 3' });

      const result = repo.findAll({ limit: 2, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('respects offset', () => {
      repo.create({ title: 'Task 1' });
      repo.create({ title: 'Task 2' });
      repo.create({ title: 'Task 3' });

      const result = repo.findAll({ limit: 50, offset: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('returns empty data when offset exceeds total', () => {
      repo.create({ title: 'Task 1' });

      const result = repo.findAll({ limit: 50, offset: 100 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('updates specified fields', () => {
      const created = repo.create({ title: 'Original' });
      const updated = repo.update(created.id, { title: 'Updated' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated');
      expect(updated?.id).toBe(created.id);
      expect(updated?.createdAt).toBe(created.createdAt);
    });

    it('refreshes updatedAt on update', () => {
      const created = repo.create({ title: 'Original' });

      // small delay to ensure different timestamp
      const updated = repo.update(created.id, { status: 'done' });

      expect(updated).toBeDefined();
      expect(updated?.updatedAt).toBeDefined();
    });

    it('returns undefined for a non-existent id', () => {
      const result = repo.update('00000000-0000-0000-0000-000000000000', { title: 'Nope' });

      expect(result).toBeUndefined();
    });

    it('preserves unchanged fields', () => {
      const created = repo.create({
        title: 'Original',
        description: 'Keep this',
        status: 'todo',
        priority: 'high',
      });

      const updated = repo.update(created.id, { title: 'New title' });

      expect(updated?.description).toBe('Keep this');
      expect(updated?.status).toBe('todo');
      expect(updated?.priority).toBe('high');
    });
  });

  describe('delete', () => {
    it('removes an existing task and returns true', () => {
      const created = repo.create({ title: 'To delete' });
      const result = repo.delete(created.id);

      expect(result).toBe(true);
      expect(repo.findById(created.id)).toBeUndefined();
    });

    it('returns false for a non-existent id', () => {
      const result = repo.delete('00000000-0000-0000-0000-000000000000');

      expect(result).toBe(false);
    });
  });
});
