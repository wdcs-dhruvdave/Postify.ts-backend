import { Request, Response, NextFunction } from 'express';

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to automatically catch and forward errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Async Middleware Wrapper
 * Wraps async middleware functions to handle errors
 */
export const asyncMiddleware = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Try-Catch wrapper for service functions
 */
export const tryCatch = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
};

/**
 * Promise-based error handler
 */
export const handlePromise = <T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> => {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[Error, null]>((error: Error) => [error, null]);
};

/**
 * Response helper functions
 */
export const sendSuccess = (
  res: Response, 
  data: any, 
  message: string = 'Success',
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (
  res: Response, 
  message: string, 
  statusCode: number = 500,
  details?: any
) => {
  const errorResponse: any = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString()
    }
  };

  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.error.details = details;
  }

  res.status(statusCode).json(errorResponse);
};
