import { Router } from "express";
import { createPost,dislikePost,getAllPosts, getCategories, getFeed, likePost, undislikePost, unlikePost } from "../controller/post/post.controller";
import { protectMiddleware } from "../middleware/auth.middleware";

const postRouter = Router();

postRouter.post("/", protectMiddleware, createPost);

postRouter.get("/", getAllPosts);
postRouter.get("/feed", protectMiddleware, getFeed);

postRouter.post('/:id/like', protectMiddleware, likePost);
postRouter.delete('/:id/like', protectMiddleware, unlikePost);

postRouter.post('/:id/dislike', protectMiddleware, dislikePost);
postRouter.delete('/:id/dislike', protectMiddleware, undislikePost);

postRouter.get('/categories',protectMiddleware, getCategories);

export default postRouter;
