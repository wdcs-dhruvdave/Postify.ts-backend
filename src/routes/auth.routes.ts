import { Router } from "express";
import { registerUser } from "../controller/auth/register.controller";
import { loginUser } from "../controller/auth/login.controller";
import { registerSchema, loginSchema } from "../validation/auth.validation";
import { validateMiddleware } from "../middleware/validate.middleware";

const authRouter = Router();

authRouter.post('/register', validateMiddleware(registerSchema), registerUser);
authRouter.post('/login', validateMiddleware(loginSchema), loginUser);

export default authRouter;