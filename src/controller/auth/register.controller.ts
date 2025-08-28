import { Request,Response } from "express";
import { errorLogger,entryLogger } from "../../utils/logger";
import { registerUserService } from "../../services/auth.service";
import { UniqueConstraintError } from "sequelize";


export const registerUser = async (req: Request, res: Response) => {
    entryLogger(`Registering user with email: ${req.body.email}`);
    try {
        const user = await registerUserService(req.body);
        return res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error: any) {
        errorLogger(error, 'User Registration Failed');
        
        if (error instanceof UniqueConstraintError) {
            if (error.errors[0].path === 'email') {
                return res.status(400).json({ message: 'Email already exists.' });
            }
            if (error.errors[0].path === 'username') {
                return res.status(400).json({ message: 'Username already exists.' });
            }
        }
        
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};