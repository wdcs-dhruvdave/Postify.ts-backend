import { Request,Response } from "express";
import bcrypt from "bcryptjs";
import {db} from "../../config/db"
import { errorLogger,entryLogger } from "../../utils/logger";
import { registerUserService } from "../../services/auth.service";


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
        if (error.code === '23505') {
            const detail = error.detail || '';
            if (detail.includes('email')) {
                return res.status(409).json({ message: 'Email already exists.' });
            }
            if (detail.includes('username')) {
                return res.status(409).json({ message: 'Username already exists.' });
            }
        }
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};