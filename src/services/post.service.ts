import { PostType, CreatePostData, CategoryType } from "../types/post.types";
import { User, Category, Comment, Dislike, Like, Follow, Post } from "../models";
import { PostAttributes } from "../models/post.model";
import sequelize from "../config/database";
import { Op, Sequelize, Transaction } from "sequelize";

export const createPostInDB = async (userId: string, data: CreatePostData): Promise<PostAttributes> => {
  let { title, content_text, image_url, category_id } = data;

  if (!category_id) {
    const generalCategory = await Category.findOne({ where: { slug: "general" } });
    if (!generalCategory) throw new Error("Default 'General' category not found.");
    category_id = generalCategory.id;
  }

  const newPost = await Post.create({
    title,
    content_text,
    image_url,
    category_id,
    user_id: userId,
    is_published: true,
  });

  const createdPost = await Post.findByPk(newPost.id, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url"],
      },
    ],
    attributes: {
      include: [
        [sequelize.literal("0"), "likes_count"],
        [sequelize.literal("0"), "dislikes_count"],
        [sequelize.literal("0"), "comments_count"],
      ],
    },
  });

  return createdPost!.toJSON();
};

export const getPostsByUsernameFromDB = async (username: string, currentUserId?: string): Promise<PostType[]> => {
  const safeCurrentUserId = currentUserId || null;
  const posts = await Post.findAll({
    include: [{
      model: User,
      as: 'author',
      where: { username },
      attributes: ['id', 'username', 'name', 'avatar_url', 'is_private']
    }],
    attributes: {
      include: [
        'id', 'title', 'content_text', 'image_url',
        [Sequelize.col('Post.created_at'), 'created_at'],
        [Sequelize.col('Post.updated_at'), 'updated_at'],
        [Sequelize.literal(`(SELECT COUNT(*) FROM likes WHERE "likes"."post_id" = "Post"."id")`), 'likes_count'],
        [Sequelize.literal(`(SELECT COUNT(*) FROM dislikes WHERE "dislikes"."post_id" = "Post"."id")`), 'dislikes_count'],
        [Sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE "comments"."post_id" = "Post"."id")`), 'comments_count'],
        [Sequelize.literal(`EXISTS(SELECT 1 FROM likes WHERE "likes"."post_id" = "Post"."id" AND "likes"."user_id" = '${safeCurrentUserId}')`), 'user_has_liked'],
        [Sequelize.literal(`EXISTS(SELECT 1 FROM dislikes WHERE "dislikes"."post_id" = "Post"."id" AND "dislikes"."user_id" = '${safeCurrentUserId}')`), 'user_has_disliked']
      ]
    },
    where: {
      is_published: true,
      [Op.or]: [
        { '$author.is_private$': false },
        { '$author.id$': currentUserId },
        Sequelize.literal(`EXISTS(SELECT 1 FROM follows WHERE "follows"."follower_id" = '${safeCurrentUserId}' AND "follows"."following_id" = "author"."id")`)
      ]
    },
    order: [[Sequelize.col('Post.created_at'), 'DESC']]
  });
  return posts.map(p => p.get({ plain: true }) as PostType);
};

export const getAllPostsFromDB = async (): Promise<PostType[]> => {
  const posts = await Post.findAll({
    attributes: {
      include: [
        [sequelize.fn("COUNT", sequelize.col("likes.id")), "likes_count"],
        [sequelize.fn("COUNT", sequelize.col("dislikes.id")), "dislikes_count"],
        [sequelize.fn("COUNT", sequelize.col("comments.id")), "comments_count"],
      ],
    },
    include: [
      { model: User, as: "author", attributes: ["id", "username", "name", "avatar_url"] },
      { model: Like, as: "likes", attributes: [] },
      { model: Dislike, as: "dislikes", attributes: [] },
      { model: Comment, as: "comments", attributes: [] },
    ],
    where: {
      is_published: true,
      "$author.is_private$": false,
    },
    group: ["Post.id", "author.id"],
    order: [["createdAt", "DESC"]],
  });

return posts.map(post => {
        const p = post.toJSON() as any;
        return {
            ...p,
            likes_count: parseInt(p.likes_count, 10),
            dislikes_count: parseInt(p.dislikes_count, 10),
            comments_count: parseInt(p.comments_count, 10),
        } as PostType;
    });};

export const getFeedFromDB = async (userId: string): Promise<PostType[]> => {
  const posts = await Post.findAll({
    attributes: {
      include: [
        [sequelize.fn("COUNT", sequelize.col("likes.id")), "likes_count"],
        [sequelize.fn("COUNT", sequelize.col("dislikes.id")), "dislikes_count"],
        [sequelize.fn("COUNT", sequelize.col("comments.id")), "comments_count"],
        [
          sequelize.literal(
            `EXISTS(SELECT 1 FROM likes WHERE likes.post_id = "Post".id AND likes.user_id = '${userId}')`
          ),
          "user_has_liked",
        ],
        [
          sequelize.literal(
            `EXISTS(SELECT 1 FROM dislikes WHERE dislikes.post_id = "Post".id AND dislikes.user_id = '${userId}')`
          ),
          "user_has_disliked",
        ],
      ],
    },
    include: [
      { model: User, as: "author", attributes: ["id", "username", "name", "avatar_url", "is_private"] },
      { model: Like, as: "likes", attributes: [] },
      { model: Dislike, as: "dislikes", attributes: [] },
      { model: Comment, as: "comments", attributes: [] },
    ],
    where: {
      is_published: true,
      [Op.or]: [
        { "$author.is_private$": false },
        { user_id: userId },
        {
          [Op.and]: [
            { "$author.is_private$": true },
            sequelize.literal(
              `EXISTS(SELECT 1 FROM follows WHERE follows.follower_id = '${userId}' AND follows.following_id = author.id)`
            ),
          ],
        },
      ],
    },
    group: ["Post.id", "author.id"],
    order: [["createdAt", "DESC"]],
  });

return posts.map(post => {
        const p = post.toJSON() as any;
        return {
            ...p,
            likes_count: parseInt(p.likes_count, 10),
            dislikes_count: parseInt(p.dislikes_count, 10),
            comments_count: parseInt(p.comments_count, 10),
        } as PostType;
    });};

export const updatePostInDB = async (
  postId: string,
  userId: string,
  data: Partial<CreatePostData>
): Promise<PostType> => {
  const post = await Post.findByPk(postId);

  if (!post) throw new Error("Post not found.");
  if (post.user_id !== userId) throw new Error("You are not authorized to update this post.");

  const updatedPost = await post.update(data);
  return updatedPost.toJSON() as PostType;
};

export const deletePostInDB = async (postId: string, userId: string): Promise<void> => {
  const post = await Post.findByPk(postId);

  if (!post) throw new Error("Post not found.");
  if (post.user_id !== userId) throw new Error("You are not authorized to delete this post.");

  await post.destroy();
};

export const likePostInDB = async (userId: string, postId: string): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Dislike.destroy({ where: { user_id: userId, post_id: postId }, transaction: t });
    await Like.findOrCreate({ where: { user_id: userId, post_id: postId }, transaction: t });
  });
};

export const unlikePostInDB = async (userId: string, postId: string): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Like.destroy({ where: { user_id: userId, post_id: postId }, transaction: t });
  });
};

export const dislikePostInDB = async (userId: string, postId: string): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Like.destroy({ where: { user_id: userId, post_id: postId }, transaction: t });
    await Dislike.findOrCreate({ where: { user_id: userId, post_id: postId }, transaction: t });
  });
};

export const undislikePostInDB = async (userId: string, postId: string): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Dislike.destroy({ where: { user_id: userId, post_id: postId }, transaction: t });
  });
};

export const getCategoriesFromDB = async (): Promise<CategoryType[]> => {
  const categories = await Category.findAll({
    order: [["name", "ASC"]],
  });
  return categories.map((category) => category.toJSON());
};
