import { Request,Response } from "express";
import { loginUserService } from "../../services/auth.service";
import { entryLogger, errorLogger } from "../../utils/logger";

export const loginUser = async (req: Request, res: Response) => {
    entryLogger(`Login attempt for email: ${req.body.email}`);
    try {
        const { token, user } = await loginUserService(req.body);
        return res.status(200).json({
            message: "Login successful",
            token,
            user
        });
    } catch (error: any) {
        errorLogger(error, 'User Login Failed');
        if (error.message === 'User not found' || error.message === 'Invalid password') {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Server error during login.' });
    }
};