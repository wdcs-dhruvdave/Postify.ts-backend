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

export default logger;