import { Router } from "express";
import { getCommentsforPost,createComment } from "../controller/comment/comment.controller";
import { protectMiddleware } from "../middleware/auth.middleware";

const commentrouter = Router();

commentrouter.get("/:id",getCommentsforPost);
commentrouter.post("/:id",protectMiddleware,createComment);

export default commentrouter;