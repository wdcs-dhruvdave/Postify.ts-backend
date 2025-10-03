import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatusCode, MESSAGES, ENV } from "../constants/constants";

interface JwtPayload {
    id: string;
    username: string;
    email: string;
    role: string;
}

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const identifyUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      req.user = decoded; 
    } catch (error) { 
    }
  }
  next(); 
};

export const protectMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.AUTH.NO_TOKEN_PROVIDED });
    }

    try{
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
        req.user = decoded;
        return next();
    }
    catch (error) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.AUTH.INVALID_TOKEN });
    }   
}