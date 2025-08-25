import { Request, Response } from "express";
import {
  createCommentInDB,
  getCommentsForPostFromDB,
} from "../../services/comment.service";
import { entryLogger } from "../../utils/logger";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const getCommentsForPost = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 15;

  try {
    const comments = await getCommentsForPostFromDB(postId, page, limit);
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error: fetching comments for post" });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { content_text, parent_id } = req.body;
  const userId = req.user?.id;

  if (!content_text || content_text.trim() === "") {
    return res.status(400).json({ message: "Comment content cannot be empty" });
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID not found" });
  }

  try {
    entryLogger(
      `User ${userId} creating comment on post ${postId} , parent comment: ${
        parent_id || "none"
      }`
    );
    const newComment = await createCommentInDB(userId, {
      content_text,
      post_id: postId,
      parent_id,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating comment" });
  }
};
