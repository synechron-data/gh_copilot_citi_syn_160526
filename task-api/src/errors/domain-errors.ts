export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  public constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  public constructor(message = 'Resource not found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

export class ValidationError extends AppError {
  public constructor(message = 'Request validation failed', details?: unknown) {
    super(message, 'VALIDATION_FAILED', 400, details);
  }
}