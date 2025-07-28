import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export const entryLogger = (message: string) => {
    logger.info(`[ENTRY] ==> ${message}`);
}

export const errorLogger = (error: Error, message: string = 'An error occurred') => {
    logger.error(`${message}: ${error.message} \n ${error.stack}`);
}

export default logger;