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
  getRecommendedPosts,
  likePost,
  undislikePost,
  unlikePost,
  updatePost,
} from "../controller/post/post.controller";
import { identifyUser, protectMiddleware } from "../middleware/auth.middleware";
import { emitActivityLog } from "../middleware/activity-logging-middleware";
import { ROUTES, ActivityType } from "../constants/constants";

const postRouter = Router();

postRouter.get("/", getAllPosts);
postRouter.get(ROUTES.POSTS.RECOMMENDED, identifyUser, getRecommendedPosts);

postRouter.get("/:username/posts", identifyUser, getPostsByUsername);
postRouter.get("/:id/likers", identifyUser, getPostLikes);
postRouter.get("/:id/dislikers", identifyUser, getPostDislikes);

postRouter.use(protectMiddleware);
postRouter.post("/", createPost);
postRouter.put("/:id", updatePost);
postRouter.delete("/:id", deletePost);
postRouter.get(ROUTES.POSTS.FEED, getFeed);

postRouter.post("/:id/like", emitActivityLog(ActivityType.POST_LIKE), likePost);
postRouter.delete("/:id/like", emitActivityLog(ActivityType.POST_UNLIKE), unlikePost);
postRouter.post("/:id/dislike", emitActivityLog(ActivityType.POST_DISLIKE), dislikePost);
postRouter.delete("/:id/dislike", emitActivityLog(ActivityType.POST_UNDISLIKE), undislikePost);
postRouter.get(ROUTES.POSTS.CATEGORIES, getCategories);
postRouter.get("/categories/:id", getCategory);

export default postRouter;
