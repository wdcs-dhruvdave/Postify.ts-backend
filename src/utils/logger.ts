import winston from 'winston';
import { CONFIG } from '../constants/constants';
import { Request, Response, NextFunction } from 'express';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: CONFIG.LOGGER.LEVEL,
  format: combine(
    colorize(),
    timestamp({ format: CONFIG.LOGGER.DATE_FORMAT }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export const entryLogger = (message: string) => {
    logger.info(`[ENTRY] ==> ${message}`);
}

export const errorLogger = (error: any, message: string = 'An error occurred') => {
    if (error instanceof Error) {
        logger.error(`${message}: ${error.message} \n ${error.stack} \n Full Error Object: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    } else {
        logger.error(`${message}: ${JSON.stringify(error)}`);
    }
}

export const errorLoggerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  errorLogger(err, `Error in ${req.method} ${req.originalUrl}`);
  next(err);
};  

export const entryLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  entryLogger(`${req.method} ${req.originalUrl}`);
  next();
};

/**
 * Global error handling middleware
 * This should be the last middleware in the chain
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  errorLogger(err, `[GLOBAL ERROR HANDLER] ${req.method} ${req.originalUrl}`);

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = undefined;

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.errors || err.message;
  } else if (err.name === 'UnauthorizedError' || err.status === 401) {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError' || err.status === 403) {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError' || err.status === 404) {
    statusCode = 404;
    message = 'Not Found';
  } else if (err.name === 'ConflictError' || err.status === 409) {
    statusCode = 409;
    message = 'Conflict';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    details = err.errors?.map((e: any) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate Entry';
    details = err.errors?.map((e: any) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid Reference';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
  } else if (err.status || err.statusCode) {
    statusCode = err.status || err.statusCode;
    message = err.message || message;
  } else if (err.message) {
    message = err.message;
  }

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    }
  };

  // Include details if available (only in development)
  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.error.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors (route not found)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  (error as any).status = 404;
  next(error);
};

export default logger;