import { Router } from "express";
import { getCommentsForPost, createComment } from "../controller/comment/comment.controller";
import { protectMiddleware } from "../middleware/auth.middleware";
import { emitActivityLog } from "../middleware/activity-logging-middleware";
import { ActivityType } from "../constants/constants";

const commentrouter = Router({ mergeParams: true });

commentrouter.get("/", getCommentsForPost);

commentrouter.use(protectMiddleware);
commentrouter.post("/", emitActivityLog(ActivityType.COMMENT), createComment);

export default commentrouter; 