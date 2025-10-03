import { Request,Response } from "express";
import { loginUserService } from "../../services/auth.service";
import { entryLogger, errorLogger } from "../../utils/logger";
import { HttpStatusCode, MESSAGES } from "../../constants/constants";

export const loginUser = async (req: Request, res: Response) => {
    entryLogger(`Login attempt for email: ${req.body.email}`);
    try {
        const { token, user } = await loginUserService(req.body);
        return res.status(HttpStatusCode.OK).json({
            message: MESSAGES.AUTH.LOGIN_SUCCESS,
            token,
            user
        });
    } catch (error: any) {
        errorLogger(error, 'User Login Failed');
        if (error.message === MESSAGES.USER.NOT_FOUND || error.message === MESSAGES.AUTH.INVALID_PASSWORD) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
        }
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};