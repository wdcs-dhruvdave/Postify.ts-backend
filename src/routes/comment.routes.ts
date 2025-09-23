import { Router } from "express";
import { getCommentsForPost, createComment } from "../controller/comment/comment.controller";
import { protectMiddleware } from "../middleware/auth.middleware";
import { emitActivityLog } from "../middleware/activity-logging-middleware";

const commentrouter = Router({ mergeParams: true });

commentrouter.get("/", getCommentsForPost);
commentrouter.post("/", protectMiddleware, emitActivityLog("comment"), createComment);

export default commentrouter; 