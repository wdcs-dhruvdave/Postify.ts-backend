import { Request, Response } from "express";
import * as PostService from '../../services/post.service';
import { entryLogger, errorLogger } from "../../utils/logger";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const createPost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    entryLogger(`User ${userId} creating a post.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const post = await PostService.createPostInDB(userId, req.body);
        return res.status(201).json({ message: "Post created successfully", post });
    } catch (error: any) {
        errorLogger(error, `Post creation failed for user ${userId}`);
        return res.status(500).json({ message: error.message || "Server error during post creation." });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    entryLogger("Fetching all public posts");
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const posts = await PostService.getAllPostsFromDB(page, limit);
        res.setHeader('Cache-Control', 'no-store');
        res.json(posts);
    } catch (error: any) {
        errorLogger(error, "Failed to fetch all posts");
        res.status(500).json({ message: "Server error fetching posts" });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    entryLogger(`User ${userId} fetching feed page ${page} with limit ${limit}.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const feedData = await PostService.getFeedFromDB(userId, page, limit);
        res.setHeader('Cache-Control', 'no-store');
        res.json(feedData);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch feed for user ${userId}`);
        res.status(500).json({ message: "Server error fetching feed" });
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
    res.status(500).json({ message: 'Server error fetching user posts.' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) =>{
  const userId = req.user!.id;
  const postId = req.params.id;

  entryLogger(`User ${userId} attempting to update post ${postId}`);

  try {
    const updatedPost = await PostService.updatePostInDB(postId, userId, req.body);
    res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error: any) {
    errorLogger(error, `Failed to update post ${postId}`);
    if (error.message.includes('not authorized')) {
        return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server error during post update.' });
  }
}

export const deletePost = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const postId = req.params.id;
  entryLogger(`User ${userId} attempting to delete post ${postId}`);

  try {
    await PostService.deletePostInDB(postId, userId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    errorLogger(error, `Failed to delete post ${postId}`);
    if (error.message.includes('not authorized')) {
        return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server error during post deletion.' });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} liking post ${postId}.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        await PostService.likePostInDB(userId, postId);
        res.status(200).json({ message: "Post liked successfully" });
    } catch (error: any) {
        errorLogger(error, `Failed to like post ${postId} for user ${userId}`);
        res.status(500).json({ message: "Server error" });
    }
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} unliking post ${postId}.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        await PostService.unlikePostInDB(userId, postId);
        res.status(200).json({ message: "Like removed successfully" });
    } catch (error: any) {
        errorLogger(error, `Failed to unlike post ${postId} for user ${userId}`);
        res.status(500).json({ message: "Server error" });
    }
};

export const dislikePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} disliking post ${postId}.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        await PostService.dislikePostInDB(userId, postId);
        res.status(200).json({ message: "Post disliked successfully" });
    } catch (error: any) {
        errorLogger(error, `Failed to dislike post ${postId} for user ${userId}`);
        res.status(500).json({ message: "Server error" });
    }
};

export const undislikePost = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;
    entryLogger(`User ${userId} removing dislike from post ${postId}.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        await PostService.undislikePostInDB(userId, postId);
        res.status(200).json({ message: "Dislike removed successfully" });
    } catch (error: any) {
        errorLogger(error, `Failed to remove dislike from post ${postId} for user ${userId}`);
        res.status(500).json({ message: "Server error" });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    entryLogger('Fetching all categories.');
    try {
        const categories = await PostService.getCategoriesFromDB();
        res.json(categories);
    } catch (error: any) {
        errorLogger(error, 'Failed to fetch categories');
        res.status(500).json({ message: "Server error fetching categories" });
    }
};

export const getPostLikes = async (req: AuthRequest, res: Response) => {
    const postId = req.params.id;
    const currentUserId = req.user?.id;
    entryLogger(`Fetching likes for post ${postId}`);

    try {
        const usersWhoLiked = await PostService.getLikesForPostFromDB(postId, currentUserId);
        res.status(200).json(usersWhoLiked);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch likes for post ${postId}`);
        res.status(500).json({ message: error.message || "Server error fetching post likes." });
    }
};

export const getPostDislikes = async (req: AuthRequest, res: Response) => {
    const postId = req.params.id;
    entryLogger(`Fetching dislikes for post ${postId}`);
    try {
        const usersWhoDisliked = await PostService.getDislikesForPostFromDB(postId);
        res.status(200).json(usersWhoDisliked);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch dislikes for post ${postId}`);
        res.status(500).json({ message: error.message || "Server error fetching post dislikes." });
    }
};
