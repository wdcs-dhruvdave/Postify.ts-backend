import { Router } from "express";
import { getCommentsForPost, createComment } from "../controller/comment/comment.controller";
import { protectMiddleware } from "../middleware/auth.middleware";

const commentrouter = Router({ mergeParams: true });

commentrouter.get("/", getCommentsForPost);
commentrouter.post("/", protectMiddleware, createComment);

export default commentrouter;