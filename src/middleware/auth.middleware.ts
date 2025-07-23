import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    user?: {
            id: string;
            username: string;
            name: string | null;
            email: string;
            role: string;
    }
}

export const protectMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string || '') as { id: string, username: string, name: string | null, email: string, role: string };
        req.user = decoded;
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }   
}