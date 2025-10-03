import { Router } from "express";
import { registerUser } from "../controller/auth/register.controller";
import { loginUser } from "../controller/auth/login.controller";
import { registerSchema, loginSchema } from "../validation/auth.validation";
import { validateMiddleware } from "../middleware/validate.middleware";
import { ROUTES } from "../constants/constants";

const authRouter = Router();

authRouter.post(ROUTES.AUTH.REGISTER, validateMiddleware(registerSchema), registerUser);
authRouter.post(ROUTES.AUTH.LOGIN, validateMiddleware(loginSchema), loginUser);

export default authRouter;