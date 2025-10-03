/**
 * Custom Error Classes for consistent error handling
 */

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors?: any[];

  constructor(message: string = 'Validation Error', errors?: any[]) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database Error') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * Error handler utility functions
 */
export const createValidationError = (errors: any[]) => {
  return new ValidationError('Validation failed', errors);
};

export const createNotFoundError = (resource: string, id?: string) => {
  const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
  return new NotFoundError(message);
};

export const createUnauthorizedError = (message?: string) => {
  return new UnauthorizedError(message);
};

export const createConflictError = (resource: string, field?: string) => {
  const message = field 
    ? `${resource} with this ${field} already exists` 
    : `${resource} already exists`;
  return new ConflictError(message);
};
