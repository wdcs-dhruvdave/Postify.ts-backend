import { PostType, CreatePostData, CategoryType } from "../types/post.types";
import {
  User,
  Category,
  Comment,
  Dislike,
  Like,
  Follow,
  Post,
  UserInterestScore,
} from "../models";
import { PostAttributes } from "../models/post.model";
import sequelize from "../config/database";
import { Op, Sequelize, Transaction } from "sequelize";
import { createNotification } from "./notification.service";
import { PublicUser } from "../types/user.types";
import { MESSAGES, CONFIG } from "../constants/constants";

export const createPostInDB = async (
  userId: string,
  data: CreatePostData
): Promise<PostAttributes> => {
  let { title, content_text, image_url, category_id } = data;

  let base64Str: string | undefined;

  if (image_url) {
    const isValidUrl = CONFIG.REGEX.BASE64_IMAGE_VIDEO;
    if (!isValidUrl.test(image_url)) {
      throw new Error("Only image and video files are allowed for media.");
    }
    base64Str = image_url.split(",")[1];
    if (!base64Str) {
      throw new Error("Invalid media format.");
    }
    const sizeInBytes =
      (base64Str.length * 3) / 4 -
      (base64Str.endsWith("==") ? 2 : base64Str.endsWith("=") ? 1 : 0);
    if (sizeInBytes > CONFIG.POST.MEDIA_SIZE_LIMIT) {
      throw new Error("Media file size exceeds 50MB limit.");
    }
  }

  if (!category_id) {
    const generalCategory = await Category.findOne({
      where: { slug: "general" },
    });
    if (!generalCategory)
      throw new Error("Default 'General' category not found.");
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
        "created_at",
        [sequelize.literal("0"), "likes_count"],
        [sequelize.literal("0"), "dislikes_count"],
        [sequelize.literal("0"), "comments_count"],
      ],
    },
  });

  return createdPost!.toJSON();
};

export const getPostsByUsernameFromDB = async (
  username: string,
  currentUserId?: string
): Promise<PostType[]> => {
  const safeCurrentUserId = currentUserId || null;

  const attributesInclude: any[] = [
    "id",
    "title",
    "content_text",
    "image_url",
    [Sequelize.col("Post.created_at"), "created_at"],
    [Sequelize.col("Post.updated_at"), "updated_at"],
    [
      Sequelize.literal(
        `(SELECT COUNT(*) FROM likes WHERE "likes"."post_id" = "Post"."id")`
      ),
      "likes_count",
    ],
    [
      Sequelize.literal(
        `(SELECT COUNT(*) FROM dislikes WHERE "dislikes"."post_id" = "Post"."id")`
      ),
      "dislikes_count",
    ],
    [
      Sequelize.literal(
        `(SELECT COUNT(*) FROM comments WHERE "comments"."post_id" = "Post"."id")`
      ),
      "comments_count",
    ],
  ];

  if (safeCurrentUserId) {
    attributesInclude.push(
      [
        Sequelize.literal(
          `EXISTS(SELECT 1 FROM likes WHERE "likes"."post_id" = "Post"."id" AND "likes"."user_id" = '${safeCurrentUserId}')`
        ),
        "user_has_liked",
      ],
      [
        Sequelize.literal(
          `EXISTS(SELECT 1 FROM dislikes WHERE "dislikes"."post_id" = "Post"."id" AND "dislikes"."user_id" = '${safeCurrentUserId}')`
        ),
        "user_has_disliked",
      ]
    );
  } else {
    attributesInclude.push(
      [Sequelize.literal("false"), "user_has_liked"],
      [Sequelize.literal("false"), "user_has_disliked"]
    );
  }

  const whereOr: any[] = [{ "$author.is_private$": false }];

  if (safeCurrentUserId) {
    whereOr.push(
      { "$author.id$": safeCurrentUserId },
      Sequelize.literal(
        `EXISTS(SELECT 1 FROM follows WHERE "follows"."follower_id" = '${safeCurrentUserId}' AND "follows"."following_id" = "author"."id")`
      )
    );
  }
  const posts = await Post.findAll({
    include: [
      {
        model: User,
        as: "author",
        where: { username },
        attributes: ["id", "username", "name", "avatar_url", "is_private"],
      },
    ],
    attributes: {
      include: attributesInclude,
    },
    where: {
      is_published: true,
      [Op.or]: whereOr,
    },
    order: [[Sequelize.col("Post.created_at"), "DESC"]],
  });
  return posts.map((p) => p.get({ plain: true }) as PostType);
};

export const getAllPostsFromDB = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows: posts } = await Post.findAndCountAll({
    where: {
      is_published: true,
      "$author.is_private$": false,
    },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url"],
      },
      { model: Like, as: "likes", attributes: [] },
      { model: Dislike, as: "dislikes", attributes: [] },
      { model: Comment, as: "comments", attributes: [] },
    ],
    attributes: {
      include: [
        "created_at",
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("likes.id"))
          ),
          "likes_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("dislikes.id"))
          ),
          "dislikes_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("comments.id"))
          ),
          "comments_count",
        ],
      ],
    },
    group: ["Post.id", "author.id"],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    subQuery: false,
  });

  const totalPosts = count.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const hasNextPage = page < totalPages;

  const formattedPosts = posts.map((post) => {
    const p = post.toJSON() as any;
    return {
      ...p,
      likes_count: parseInt(p.likes_count, 10) || 0,
      dislikes_count: parseInt(p.dislikes_count, 10) || 0,
      comments_count: parseInt(p.comments_count, 10) || 0,
    } as PostType;
  });

  return {
    posts: formattedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage,
      totalPosts,
    },
  };
};

export const getFeedFromDB = async (
  userId: string,
  page = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const { count, rows: posts } = await Post.findAndCountAll({
    attributes: {
      include: [
        "created_at",
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("likes.id"))
          ),
          "likes_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("dislikes.id"))
          ),
          "dislikes_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("comments.id"))
          ),
          "comments_count",
        ],
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
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url", "is_private"],
      },
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
    limit,
    offset,
    subQuery: false,
  });

  const totalPosts = count.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const hasNextPage = page < totalPages;

  const formattedPosts = posts.map((post) => {
    const p = post.toJSON() as any;
    return {
      ...p,
      likes_count: parseInt(p.likes_count, 10) || 0,
      dislikes_count: parseInt(p.dislikes_count, 10) || 0,
      comments_count: parseInt(p.comments_count, 10) || 0,
    } as PostType;
  });

  return {
    posts: formattedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage,
      totalPosts,
    },
  };
};

export const getRecommendedPostsFromDB = async (
  userId: string,
  page = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  // Get top 3 categories for the user
  const topCategories = await UserInterestScore.findAll({
    where: { user_id: userId },
    order: [["score", "DESC"]],
    limit: 3,
    attributes: ["category_id", "score"],
    raw: true,
  });

  if (!topCategories.length) {
    return {
      posts: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        totalPosts: 0,
      },
    };
  }

  const categoryIds = topCategories.map((c) => c.category_id);

  const { count, rows: posts } = await Post.findAndCountAll({
    attributes: {
      include: [
        "created_at",
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("likes.id"))
          ),
          "likes_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("dislikes.id"))
          ),
          "dislikes_count",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("comments.id"))
          ),
          "comments_count",
        ],
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
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url", "is_private"],
      },
      { model: Like, as: "likes", attributes: [] },
      { model: Dislike, as: "dislikes", attributes: [] },
      { model: Comment, as: "comments", attributes: [] },
    ],
    where: {
      is_published: true,
      category_id: { [Op.in]: categoryIds },
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
    order: [
      [
        sequelize.literal(
          `"Post"."created_at" + (RANDOM() * interval '1 hour')`
        ),
        "DESC",
      ],
    ],
    limit,
    offset,
    subQuery: false,
  });

  const totalPosts = count.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const hasNextPage = page < totalPages;

  const formattedPosts = posts.map((post) => {
    const p = post.toJSON() as any;
    return {
      ...p,
      likes_count: parseInt(p.likes_count, 10) || 0,
      dislikes_count: parseInt(p.dislikes_count, 10) || 0,
      comments_count: parseInt(p.comments_count, 10) || 0,
    } as PostType;
  });

  return {
    posts: formattedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage,
      totalPosts,
    },
  };
};


export const updatePostInDB = async (
  postId: string,
  userId: string,
  data: Partial<CreatePostData>
): Promise<PostType> => {
  const post = await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url", "is_private"],
      },
    ],
  });

  if (!post) throw new Error(MESSAGES.POST.NOT_FOUND);
  if (post.user_id !== userId) throw new Error(MESSAGES.COMMON.UNAUTHORIZED);

  await post.update(data);

  const updatedPost = await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "name", "avatar_url", "is_private"],
      },
    ],
  });

  return updatedPost!.toJSON() as PostType;
};

export const deletePostInDB = async (
  postId: string,
  userId: string
): Promise<void> => {
  const post = await Post.findByPk(postId);

  if (!post) throw new Error(MESSAGES.POST.NOT_FOUND);
  if (post.user_id !== userId) throw new Error(MESSAGES.COMMON.UNAUTHORIZED);

  await post.destroy();
};

export const likePostInDB = async (
  userId: string,
  postId: string
): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Dislike.destroy({
      where: { user_id: userId, post_id: postId },
      transaction: t,
    });
    await Like.findOrCreate({
      where: { user_id: userId, post_id: postId },
      transaction: t,
    });
  });
  const post = await Post.findByPk(postId, { attributes: ["user_id"] });
  if (post) {
    await createNotification(post.user_id, userId, "like", postId);
  }
  console.log(`Post ${postId} liked by user ${userId}`);
};

export const unlikePostInDB = async (
  userId: string,
  postId: string
): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Like.destroy({
      where: { user_id: userId, post_id: postId },
      transaction: t,
    });
  });
};

export const dislikePostInDB = async (
  userId: string,
  postId: string
): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Like.destroy({
      where: { user_id: userId, post_id: postId },
      transaction: t,
    });
    await Dislike.findOrCreate({
      where: { user_id: userId, post_id: postId },
      transaction: t,
    });
  });
  const post = await Post.findByPk(postId, { attributes: ["user_id"] });
  if (post) {
    await createNotification(post.user_id, userId, "dislike", postId);
  }
  console.log(`Post ${postId} disliked by user ${userId}`);
};

export const undislikePostInDB = async (
  userId: string,
  postId: string
): Promise<void> => {
  await sequelize.transaction(async (t: Transaction) => {
    await Dislike.destroy({
      where: { user_id: userId, post_id: postId },
      transaction: t,
    });
  });
};

export const getCategoriesFromDB = async (): Promise<CategoryType[]> => {
  const categories = await Category.findAll({
    order: [["name", "ASC"]],
  });
  return categories.map((category) => category.toJSON());
};

export const getCategoryFromDb = async (
  catgoryId: string
): Promise<CategoryType | null> => {
  const category = await Category.findByPk(catgoryId);
  if (!category) return null;
  return category.toJSON();
};

export const getLikesForPostFromDB = async (
  postId: string,
  currentUserId?: string
): Promise<PublicUser[]> => {
  const attributes: any[] = ["id", "username", "name", "avatar_url"];
  if (currentUserId) {
    attributes.push([
      Sequelize.literal(
        `EXISTS(SELECT 1 FROM follows WHERE "follows"."follower_id" = '${currentUserId}' AND "follows"."following_id" = "user"."id")`
      ),
      "is_following",
    ]);
  }
  const likes = await Like.findAll({
    where: { post_id: postId },
    include: [
      {
        model: User,
        as: "user",
        attributes,
      },
    ],
  });
  return likes.map((like) => like.get("user") as PublicUser);
};

export const getDislikesForPostFromDB = async (
  postId: string,
  currentUserId?: string
): Promise<PublicUser[]> => {
  const attributes: any[] = ["id", "username", "name", "avatar_url"];
  if (currentUserId) {
    attributes.push([
      Sequelize.literal(
        `EXISTS(SELECT 1 FROM follows WHERE "follows"."follower_id" = '${currentUserId}' AND "follows"."following_id" = "user"."id")`
      ),
      "is_following",
    ]);
  }
  const dislikes = await Dislike.findAll({
    where: { post_id: postId },
    include: [
      {
        model: User,
        as: "user",
        attributes,
      },
    ],
  });
  return dislikes.map((dislike) => dislike.get("user") as PublicUser);
};

export const getCommentsforPostFromDB = async (
  postId: string,
  currentUserId?: string
): Promise<PublicUser[]> => {
  const attributes: any[] = ["id", "username", "name", "avatar_url"];
  if (currentUserId) {
    attributes.push([
      Sequelize.literal(
        `EXISTS(SELECT 1 FROM follows WHERE "follows"."follower_id" = '${currentUserId}' AND "follows"."following_id" = "user"."id")`
      ),
      "is_following",
    ]);
  }
  const comments = await Comment.findAll({
    where: { post_id: postId },
    include: [
      {
        model: User,
        as: "user",
        attributes,
      },
    ],
  });
  return comments.map((comment) => comment.get("user") as PublicUser);
};
