import { Router } from "express";
import {
  createPost,
  deletePost,
  dislikePost,
  getAllPosts,
  getCategories,
  getCategory,
  getFeed,
  getPostDislikes,
  getPostLikes,
  getPostsByUsername,
  likePost,
  undislikePost,
  unlikePost,
  updatePost,
} from "../controller/post/post.controller";
import { identifyUser, protectMiddleware } from "../middleware/auth.middleware";
import { emitActivityLog } from "../middleware/activity-logging-middleware";
import { ROUTES } from "../constants/constants";

const postRouter = Router();

postRouter.post("/", protectMiddleware, createPost);

postRouter.put("/:id", protectMiddleware, updatePost);
postRouter.delete("/:id", protectMiddleware, deletePost);

postRouter.get("/", getAllPosts);
postRouter.get(ROUTES.POSTS.FEED, protectMiddleware, getFeed);

postRouter.post(
  "/:id/like",
  protectMiddleware,
  emitActivityLog("post_like"),
  likePost
);
postRouter.delete(
  "/:id/like",
  protectMiddleware,
  emitActivityLog("post_dislike"),
  unlikePost
);

postRouter.post(
  "/:id/dislike",
  protectMiddleware,
  emitActivityLog("post_dislike"),
  dislikePost
);
postRouter.delete(
  "/:id/dislike",
  protectMiddleware,
  emitActivityLog("post_dislike"),
  undislikePost
);

postRouter.get(ROUTES.POSTS.CATEGORIES, protectMiddleware, getCategories);

postRouter.get("/categories/:id", protectMiddleware, getCategory);

postRouter.get("/:username/posts", identifyUser, getPostsByUsername);

postRouter.get("/:id/likers", identifyUser, getPostLikes);

postRouter.get("/:id/dislikers", identifyUser, getPostDislikes);

export default postRouter;
