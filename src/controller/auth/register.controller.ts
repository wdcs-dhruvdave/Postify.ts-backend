import { Request,Response } from "express";
import { errorLogger,entryLogger } from "../../utils/logger";
import { registerUserService } from "../../services/auth.service";
import { UniqueConstraintError } from "sequelize";
import { HttpStatusCode, MESSAGES } from "../../constants/constants";


export const registerUser = async (req: Request, res: Response) => {
    entryLogger(`Registering user with email: ${req.body.email}`);
    try {
        const user = await registerUserService(req.body);
        return res.status(HttpStatusCode.CREATED).json({
            message: MESSAGES.AUTH.REGISTER_SUCCESS,
            user
        });
    } catch (error: any) {
        errorLogger(error, 'User Registration Failed');
        
        if (error instanceof UniqueConstraintError) {
            if (error.errors[0].path === 'email') {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.AUTH.EMAIL_EXISTS });
            }
            if (error.errors[0].path === 'username') {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.AUTH.USERNAME_EXISTS });
            }
        }
        
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};