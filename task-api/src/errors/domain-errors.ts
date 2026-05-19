export class NotFoundError extends Error {
  public readonly code = 'NOT_FOUND' as const;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  public readonly code = 'VALIDATION_FAILED' as const;
  public readonly details: ReadonlyArray<{ path: string; message: string }>;

  constructor(message: string, details: ReadonlyArray<{ path: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}
