import { Request, Response } from "express";
import {
  createCommentInDB,
  getCommentsForPostFromDB,
} from "../../services/comment.service";
import { entryLogger } from "../../utils/logger";
import { HttpStatusCode, MESSAGES } from "../../constants/constants";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const getCommentsForPost = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 15;

  try {
    const comments = await getCommentsForPostFromDB(postId, page, limit);
    res.status(HttpStatusCode.OK).json(comments);
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.COMMENT.SERVER_ERROR_FETCHING_COMMENTS });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { content_text, parent_id } = req.body;
  const userId = req.user?.id;

  if (!content_text || content_text.trim() === "") {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ message: MESSAGES.COMMENT.EMPTY_CONTENT });
  }

  if (!userId) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: MESSAGES.COMMENT.UNAUTHORIZED_USER_ID_NOT_FOUND });
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

    res.status(HttpStatusCode.CREATED).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.COMMENT.SERVER_ERROR_CREATING_COMMENT });
  }
};
