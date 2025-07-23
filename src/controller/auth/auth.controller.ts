import { Router } from "express";
import { registerUser } from "./register.controller";
import { loginUser } from "./login.controller";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

export default authRouter;