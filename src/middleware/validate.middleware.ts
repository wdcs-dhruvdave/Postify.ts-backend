import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import { HttpStatusCode, MESSAGES } from '../constants/constants';

export const validateMiddleware = (Schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await Schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;
      return next();
    } catch (error) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: MESSAGES.COMMON.VALIDATION_ERROR,
        error: error,
      });
    }
  };
};