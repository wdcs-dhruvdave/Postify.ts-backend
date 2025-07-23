import { Router } from "express";
import { createPost,getAllPosts } from "../controller/post/post.controller";
import { protectMiddleware } from "../middleware/auth.middleware";

const postRouter = Router();

postRouter.post("/", protectMiddleware, createPost);
postRouter.get("/", protectMiddleware, getAllPosts);

export default postRouter;
