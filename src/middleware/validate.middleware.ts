import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

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
      return res.status(400).json({
        message: "Validation Error",
        error: error,
      });
    }
  };
};
