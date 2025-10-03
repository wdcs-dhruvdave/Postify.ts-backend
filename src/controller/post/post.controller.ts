import { Request, Response } from "express";
import * as PostService from '../../services/post.service';
import { entryLogger, errorLogger } from "../../utils/logger";
import { HttpStatusCode, MESSAGES, CONFIG } from "../../constants/constants";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const createPost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    entryLogger(`User ${userId} creating a post.`);
    if (!userId) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
    try {
        const post = await PostService.createPostInDB(userId, req.body);
        return res.status(HttpStatusCode.CREATED).json({ message: MESSAGES.POST.CREATED_SUCCESS, post });
    } catch (error: any) {
        errorLogger(error, `Post creation failed for user ${userId}`);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message || MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    entryLogger("Fetching all public posts");
    try {
        const page = parseInt(req.query.page as string, 10) || CONFIG.PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit as string, 10) || CONFIG.PAGINATION.DEFAULT_LIMIT;
        const posts = await PostService.getAllPostsFromDB(page, limit);
        res.setHeader('Cache-Control', 'no-store');
        res.json(posts);
    } catch (error: any) {
        errorLogger(error, "Failed to fetch all posts");
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string, 10) || CONFIG.PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string, 10) || CONFIG.PAGINATION.DEFAULT_LIMIT;

    entryLogger(`User ${userId} fetching feed page ${page} with limit ${limit}.`);
    if (!userId) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
    try {
        const feedData = await PostService.getFeedFromDB(userId, page, limit);
        res.setHeader('Cache-Control', 'no-store');
        res.json(feedData);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch feed for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getPostsByUsername = async (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const currentUserId = req.user?.id; 
  
  entryLogger(`Fetching posts for user: ${username}`);
  try {
    const posts = await PostService.getPostsByUsernameFromDB(username, currentUserId);
    res.json(posts);
  } catch (error: any) {
    errorLogger(error, `Failed to get posts for user: ${username}`);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) =>{
  const userId = req.user!.id;
  const postId = req.params.id;

  entryLogger(`User ${userId} attempting to update post ${postId}`);

  try {
    const updatedPost = await PostService.updatePostInDB(postId, userId, req.body);
    res.status(HttpStatusCode.OK).json({ message: MESSAGES.POST.UPDATED_SUCCESS, post: updatedPost });
  } catch (error: any) {
    errorLogger(error, `Failed to update post ${postId}`);
    if (error.message === MESSAGES.COMMON.UNAUTHORIZED) {
        return res.status(HttpStatusCode.FORBIDDEN).json({ message: error.message });
    }
    if (error.message === MESSAGES.POST.NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json({ message: error.message });
    }
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message || MESSAGES.COMMON.SERVER_ERROR });
  }
}

export const deletePost = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const postId = req.params.id;
  entryLogger(`User ${userId} attempting to delete post ${postId}`);

  try {
    await PostService.deletePostInDB(postId, userId);
    res.status(HttpStatusCode.OK).json({ message: MESSAGES.POST.DELETED_SUCCESS });
  } catch (error: any) {
    errorLogger(error, `Failed to delete post ${postId}`);
    if (error.message === MESSAGES.COMMON.UNAUTHORIZED) {
        return res.status(HttpStatusCode.FORBIDDEN).json({ message: error.message });
    }
    if (error.message === MESSAGES.POST.NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json({ message: error.message });
    }
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message || MESSAGES.COMMON.SERVER_ERROR });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;  
    const postId = req.params.id;
    entryLogger(`User ${userId} liking post ${postId}.`);
    if (!userId) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
    try {
        await PostService.likePostInDB(userId, postId);
        res.status(HttpStatusCode.OK).json({ message: MESSAGES.POST.LIKED_SUCCESS });
    } catch (error: any) {
        errorLogger(error, `Failed to like post ${postId} for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} unliking post ${postId}.`);
    if (!userId) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
    try {
        await PostService.unlikePostInDB(userId, postId);
        res.status(HttpStatusCode.OK).json({ message: MESSAGES.POST.LIKE_REMOVED_SUCCESS });
    } catch (error: any) {
        errorLogger(error, `Failed to unlike post ${postId} for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const dislikePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} disliking post ${postId}.`);
    if (!userId) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
    try {
        await PostService.dislikePostInDB(userId, postId);
        res.status(HttpStatusCode.OK).json({ message: MESSAGES.POST.DISLIKED_SUCCESS });
    } catch (error: any) {
        errorLogger(error, `Failed to dislike post ${postId} for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const undislikePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} removing dislike from post ${postId}.`);
    if (!userId) return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMON.UNAUTHORIZED });
    try {
        await PostService.undislikePostInDB(userId, postId);
        res.status(HttpStatusCode.OK).json({ message: MESSAGES.POST.DISLIKE_REMOVED_SUCCESS });
    } catch (error: any) {
        errorLogger(error, `Failed to remove dislike from post ${postId} for user ${userId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    entryLogger('Fetching all categories.');
    try {
        const categories = await PostService.getCategoriesFromDB();
        res.json(categories);
    } catch (error: any) {
        errorLogger(error, 'Failed to fetch categories');
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getCategory = async (req: Request, res: Response) => {
    const categoryId = req.params.id;
    entryLogger(`Fetching category ${categoryId}.`);
    try {
        const category = await PostService.getCategoryFromDb(categoryId);
        if (!category) {
            return res.status(HttpStatusCode.NOT_FOUND).json({ message: MESSAGES.POST.CATEGORY_NOT_FOUND });
        }
        res.status(HttpStatusCode.OK).json(category);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch category ${categoryId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getPostLikes = async (req: AuthRequest, res: Response) => {
    const postId = req.params.id;
    const currentUserId = req.user?.id;
    entryLogger(`Fetching likes for post ${postId}`);

    try {
        const usersWhoLiked = await PostService.getLikesForPostFromDB(postId, currentUserId);
        res.status(HttpStatusCode.OK).json(usersWhoLiked);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch likes for post ${postId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message || MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getRecommendedPosts = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id || (req.query.userId as string);
    const page = parseInt(req.query.page as string, 10) || CONFIG.PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string, 10) || CONFIG.PAGINATION.DEFAULT_LIMIT;

    entryLogger(`Fetching recommended posts for user ${userId || 'anonymous'} - page ${page}, limit ${limit}`);
    
    try {
        const recommendedData = await PostService.getRecommendedPostsFromDB(userId, page, limit);
        res.setHeader('Cache-Control', 'no-store');
        res.json(recommendedData);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch recommended posts for user ${userId || 'anonymous'}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMON.SERVER_ERROR });
    }
};

export const getPostDislikes = async (req: AuthRequest, res: Response) => {
    const postId = req.params.id;
    entryLogger(`Fetching dislikes for post ${postId}`);
    try {
        const usersWhoDisliked = await PostService.getDislikesForPostFromDB(postId);
        res.status(HttpStatusCode.OK).json(usersWhoDisliked);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch dislikes for post ${postId}`);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message || MESSAGES.COMMON.SERVER_ERROR });
    }
};
