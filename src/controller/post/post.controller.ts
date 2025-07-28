import { Request, Response } from "express";
import * as PostService from '../../services/post.service';
import { entryLogger, errorLogger } from "../../utils/logger";

interface AuthRequest extends Request {
  user?: { id: string };
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
    entryLogger('Fetching all public posts.');
    try {
        const posts = await PostService.getAllPostsFromDB();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (error: any) {
        errorLogger(error, 'Failed to retrieve posts');
        return res.status(500).json({ message: "Server error during post retrieval." });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    entryLogger(`User ${userId} fetching feed.`);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const posts = await PostService.getFeedFromDB(userId);
        res.setHeader('Cache-Control', 'no-store');
        res.json(posts);
    } catch (error: any) {
        errorLogger(error, `Failed to fetch feed for user ${userId}`);
        res.status(500).json({ message: "Server error fetching feed" });
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