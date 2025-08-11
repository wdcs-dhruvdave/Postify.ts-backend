import { Router } from "express";
import { createPost,deletePost,dislikePost,getAllPosts, getCategories, getFeed, likePost, undislikePost, unlikePost, updatePost } from "../controller/post/post.controller";
import { protectMiddleware } from "../middleware/auth.middleware";

const postRouter = Router();

postRouter.post("/", protectMiddleware, createPost);

postRouter.put('/:id', protectMiddleware, updatePost);
postRouter.delete('/:id', protectMiddleware, deletePost);

postRouter.get("/", getAllPosts);
postRouter.get("/feed", protectMiddleware, getFeed);

postRouter.post('/:id/like', protectMiddleware, likePost);
postRouter.delete('/:id/like', protectMiddleware, unlikePost);

postRouter.post('/:id/dislike', protectMiddleware, dislikePost);
postRouter.delete('/:id/dislike', protectMiddleware, undislikePost);

postRouter.get('/categories',protectMiddleware, getCategories);

export default postRouter;
