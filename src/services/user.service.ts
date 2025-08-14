import { User, Follow, Post } from '../models';
import { PublicUser } from '../types/user.types';
import { UserAttributes } from '../models/user.model';
import { Sequelize, Op } from 'sequelize';
import { PostType } from '../types/post.types';

export interface UserProfile extends PublicUser {
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

export const searchUsersInDB = async (query: string, currentUserId: string): Promise<PublicUser[]> => {
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { username: { [Op.iLike]: `%${query}%` } },
      ],
      // id: { [Op.ne]: currentUserId }
    },
    attributes: [
      'id', 'username', 'name', 'avatar_url',
      [Sequelize.col('created_at'), 'created_at'], 
      [Sequelize.col('updated_at'), 'updated_at'],
      [
        Sequelize.literal(`EXISTS(
          SELECT 1 FROM follows 
          WHERE "follows"."follower_id" = '${currentUserId}' 
          AND "follows"."following_id" = "User"."id"
        )`),
        'is_following'
      ]
    ],
    limit: 10,
  });
  return users.map(u => u.get({ plain: true }) as unknown as PublicUser);
};

export const getUserProfileFromDB = async (username: string, currentUserId?: string): Promise<UserProfile | null> => {
    const user = await User.findOne({
        where: { username },
        attributes: {
            include: [
                'id', 'username', 'name', 'avatar_url', 'bio', 'is_private',
                [Sequelize.col('created_at'), 'created_at'],
                [Sequelize.col('updated_at'), 'updated_at'],
                [Sequelize.literal(`(SELECT COUNT(*) FROM follows WHERE "follows"."following_id" = "User"."id")`), 'followers_count'],
                [Sequelize.literal(`(SELECT COUNT(*) FROM follows WHERE "follows"."follower_id" = "User"."id")`), 'following_count'],
                [Sequelize.literal(`EXISTS(SELECT 1 FROM follows WHERE "follows"."follower_id" = '${currentUserId || null}' AND "follows"."following_id" = "User"."id")`), 'is_following']
            ]
        },
        group: ['User.id']
    });

    if (!user) return null;
    
    const userJson = user.get({ plain: true }) as any;
    userJson.followers_count = parseInt(userJson.followers_count, 10);
    userJson.following_count = parseInt(userJson.following_count, 10);
    
    return userJson as UserProfile;
};

export const getPostsByUsernameFromDB = async (username: string, currentUserId?: string): Promise<PostType[]> => {
  const safeCurrentUserId = currentUserId || null;
  const posts = await Post.findAll({
    include: [{
      model: User,
      as: 'author',
      where: { username },
      attributes: ['id', 'username', 'name', 'avatar_url'] 
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


export const getFollowSuggestionsFromDB = async (userId: string, limit: number = 5): Promise<PublicUser[]> => {
  const suggestions = await User.findAll({
    where: {
      id: {
        [Op.ne]: userId,
        [Op.notIn]: Sequelize.literal(`(SELECT following_id FROM follows WHERE follower_id = '${userId}')`)
      }
    },
    attributes: [
        'id', 'username', 'name', 'avatar_url', 
        [Sequelize.col('created_at'), 'created_at'], 
        [Sequelize.col('updated_at'), 'updated_at']
    ],
    order: [Sequelize.fn('RANDOM')],
    limit
  });

  return suggestions.map(u => u.get({ plain: true }) as unknown as PublicUser);
};

export const getFollowersFromDB = async (username: string): Promise<PublicUser[]> => {
  const user = await User.findOne({ where: { username }, attributes: ['id'] });
  if (!user) throw new Error('User not found');

  const followers = await Follow.findAll({
    where: { following_id: (user as any).id },
    include: [{
      model: User,
      as: 'follower',
      attributes: ['id', 'username', 'name', 'avatar_url', ['createdAt', 'created_at'], ['updatedAt', 'updated_at']]
    }]
  });

  return followers.map(f => (f as any).follower.toJSON() as PublicUser);
};

export const getFollowingFromDB = async (username: string): Promise<PublicUser[]> => {
  const user = await User.findOne({ where: { username }, attributes: ['id'] });
  if (!user) throw new Error('User not found');

  const following = await Follow.findAll({
    where: { follower_id: (user as any).id },
    include: [{
      model: User,
      as: 'following',
      attributes: ['id', 'username', 'name', 'avatar_url', ['createdAt', 'created_at'], ['updatedAt', 'updated_at']]
    }]
  });

  return following.map(f => (f as any).following.toJSON() as PublicUser);
};

export const updateUserProfileInDB = async (userId: number, data: { name?: string; bio?: string; avatar_url?: string }): Promise<Omit<UserAttributes, 'password'>> => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  await user.update(data);

  const { password, ...rest } = user.toJSON();
  return rest;
};

export const updatePrivacyInDB = async (userId: string, isPrivate: boolean): Promise<Omit<UserAttributes, 'password'>> => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    await user.update({ is_private: isPrivate });
    const { password, ...safeUser } = user.toJSON();
    return safeUser;
};

export const followUserInDB = async (followerId: number, followingId: number): Promise<void> => {
  await Follow.findOrCreate({
    where: { follower_id: followerId, following_id: followingId }
  });
};

export const unfollowUserInDB = async (followerId: number, followingId: number): Promise<void> => {
  await Follow.destroy({
    where: { follower_id: followerId, following_id: followingId }
  });
};
