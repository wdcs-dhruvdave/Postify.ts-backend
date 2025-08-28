import { CommentType } from "../types/comment.types";
import { User, Comment, Post } from "../models";
import { createNotification } from "./notification.service";

const getCommentIncludeStructure = (level = 0) => {
  if (level > 5) {
    return [];
  }

  const structure: any = [
    {
      model: User,
      as: "author",
      attributes: ["id", "username", "name", "avatar_url"],
    },
    {
      model: Comment,
      as: "replies",
      include: getCommentIncludeStructure(level + 1),
    },
  ];

  return structure;
};

export const getCommentsForPostFromDB = async (
  postId: string,
  page = 1,
  limit = 15
) => {
  const offset = (page - 1) * limit;
  const post = await Post.findByPk(postId);
  if (!post) throw new Error("Post not found");

  const { count, rows: comments } = await Comment.findAndCountAll({
    where: {
      post_id: postId,
      parent_id: null, 
    },
    include: getCommentIncludeStructure(),
    order: [["created_at", "ASC"]],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);
  const hasNextPage = page < totalPages;

  return comments.map((comment) => comment.toJSON() as CommentType);
};

export const createCommentInDB = async (
  userId: string,
  data: { content_text: string; post_id: string; parent_id?: string | null }
): Promise<CommentType> => {
  const newComment = await Comment.create({
    user_id: userId,
    post_id: data.post_id,
    content_text: data.content_text,
    parent_id: data.parent_id,
  });

  const createdComment = await Comment.findByPk(newComment.id, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
  });

  await createNotification(data.post_id, userId, "comment", newComment.id)
    .then(() => {
      console.log("Notification created for comment:", newComment.id);
    })
    .catch((error) => {
      console.error("Error creating notification for comment:", error);
    });

  if (!createdComment) {
    throw new Error("Comment creation failed");
  }

  return createdComment.toJSON() as CommentType;
};
