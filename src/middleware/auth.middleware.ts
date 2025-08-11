import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      req.user = decoded; 
    } catch (error) { 
    }
  }
  next(); 
};

export const protectMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string || '') as JwtPayload;
        req.user = decoded;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }   
}