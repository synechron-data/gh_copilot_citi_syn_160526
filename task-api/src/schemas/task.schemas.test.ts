import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema, taskIdParamSchema } from './task.schemas.js';

describe('createTaskSchema', () => {
  it('accepts a valid full body', () => {
    const result = createTaskSchema.parse({
      title: 'My Task',
      description: 'Details',
      status: 'in_progress',
      priority: 'high',
    });

    expect(result.title).toBe('My Task');
    expect(result.description).toBe('Details');
    expect(result.status).toBe('in_progress');
    expect(result.priority).toBe('high');
  });

  it('applies defaults for optional fields', () => {
    const result = createTaskSchema.parse({ title: 'Minimal' });

    expect(result.description).toBe('');
    expect(result.status).toBe('todo');
    expect(result.priority).toBe('medium');
  });

  it('trims whitespace from title', () => {
    const result = createTaskSchema.parse({ title: '  Trimmed  ' });

    expect(result.title).toBe('Trimmed');
  });

  it('rejects an empty title', () => {
    expect(() => createTaskSchema.parse({ title: '' })).toThrow();
  });

  it('rejects a title that is only whitespace', () => {
    expect(() => createTaskSchema.parse({ title: '   ' })).toThrow();
  });

  it('rejects a title longer than 200 characters', () => {
    expect(() => createTaskSchema.parse({ title: 'a'.repeat(201) })).toThrow();
  });

  it('accepts a title of exactly 200 characters', () => {
    const result = createTaskSchema.parse({ title: 'a'.repeat(200) });
    expect(result.title).toHaveLength(200);
  });

  it('rejects an invalid status', () => {
    expect(() => createTaskSchema.parse({ title: 'Task', status: 'invalid' })).toThrow();
  });

  it('rejects an invalid priority', () => {
    expect(() => createTaskSchema.parse({ title: 'Task', priority: 'invalid' })).toThrow();
  });

  it('rejects a description longer than 2000 characters', () => {
    expect(() =>
      createTaskSchema.parse({ title: 'Task', description: 'a'.repeat(2001) }),
    ).toThrow();
  });
});

describe('updateTaskSchema', () => {
  it('accepts a partial update with one field', () => {
    const result = updateTaskSchema.parse({ status: 'done' });

    expect(result.status).toBe('done');
  });

  it('accepts multiple fields', () => {
    const result = updateTaskSchema.parse({ title: 'New', priority: 'low' });

    expect(result.title).toBe('New');
    expect(result.priority).toBe('low');
  });

  it('rejects an empty body', () => {
    expect(() => updateTaskSchema.parse({})).toThrow();
  });

  it('rejects an empty title', () => {
    expect(() => updateTaskSchema.parse({ title: '' })).toThrow();
  });
});

describe('listTasksQuerySchema', () => {
  it('applies defaults', () => {
    const result = listTasksQuerySchema.parse({});

    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('coerces string numbers', () => {
    const result = listTasksQuerySchema.parse({ limit: '10', offset: '5' });

    expect(result.limit).toBe(10);
    expect(result.offset).toBe(5);
  });

  it('accepts valid status and priority filters', () => {
    const result = listTasksQuerySchema.parse({ status: 'todo', priority: 'high' });

    expect(result.status).toBe('todo');
    expect(result.priority).toBe('high');
  });

  it('rejects limit greater than 200', () => {
    expect(() => listTasksQuerySchema.parse({ limit: 201 })).toThrow();
  });

  it('rejects negative offset', () => {
    expect(() => listTasksQuerySchema.parse({ offset: -1 })).toThrow();
  });
});

describe('taskIdParamSchema', () => {
  it('accepts a valid UUID', () => {
    const result = taskIdParamSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000' });

    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects a non-UUID string', () => {
    expect(() => taskIdParamSchema.parse({ id: 'not-a-uuid' })).toThrow();
  });
});
