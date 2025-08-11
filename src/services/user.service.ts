import { query } from "winston";
import { db } from "../config/db";
import { PublicUser } from "../types/user.types";
import e from "express";
import { Post } from "../types/post.types";

export interface UserProfile extends PublicUser {
  followers_count: number;
  following_count: number;
}
export const searchUsersInDB = async (query: string, currentUserId: string): Promise<PublicUser[]> => {
    const searchQuery = `
        SELECT 
            u.id, 
            u.username, 
            u.name, 
            u.avatar_url,
            EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) as is_following
        FROM users u 
        WHERE 
            (u.username ILIKE $1 OR COALESCE(u.name, '') ILIKE $1) 
            AND u.id != $2
        LIMIT 10
    `;
    const { rows } = await db.query(searchQuery, [`%${query}%`, currentUserId]);
    return rows;
};

export const getUserProfileFromDB = async (username: string, currentUserId?: string): Promise<UserProfile | null> => {
  const query = `
    SELECT 
      u.id, u.username, u.name, u.avatar_url, u.bio, u.created_at,
      -- ADD THIS LINE to fetch the privacy status
      u.is_private,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
      EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) as is_following
    FROM users u
    WHERE u.username = $1;
  `;
  const { rows } = await db.query(query, [username, currentUserId]);
  if (rows.length === 0) {
    return null;
  }
  rows[0].followers_count = parseInt(rows[0].followers_count, 10);
  rows[0].following_count = parseInt(rows[0].following_count, 10);
  return rows[0];
};

export const getFollowSuggestionsFromDB = async(userId:string):Promise<PublicUser[]> => {
    const query = `
    SELECT id, username, name, avatar_url FROM users
    WHERE id != $1 AND id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = $1
    )
    LIMIT 5;
  `;

  const {rows} = await db.query(query, [userId]);
  return rows;
}

export const followUserInDB = async (followerId: string, followingId: string): Promise<void> => {
  const query = 'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)';
  await db.query(query, [followerId, followingId]);
};

export const unfollowUserInDB = async (followerId: string, followingId: string): Promise<void> => {
  const query = 'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2';
  await db.query(query, [followerId, followingId]);
};



export const updatePrivacyInDB = async (userId: string, isPrivate: boolean): Promise<PublicUser> => {
  const query = `
    UPDATE users 
    SET is_private = $1, updated_at = NOW() 
    WHERE id = $2
    RETURNING id, username, name, email, role, avatar_url, bio, is_private;
  `;
  const { rows } = await db.query(query, [isPrivate, userId]);
  return rows[0];
};

export const getPostsByUsernameFromDB = async (username: string, currentUserId?: string): Promise<Post[]> => {
  const query = `
    SELECT 
      p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'name', u.name,
        'avatar_url', u.avatar_url
      ) as author,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
      (SELECT COUNT(*) FROM dislikes WHERE post_id = p.id) as dislikes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE 
      u.username = $1 AND p.is_published = true AND
      (
        -- Condition 1: Always show posts if the profile is public.
        u.is_private = false OR
        
        -- Condition 2: Or, if the profile is private, only show posts if the
        -- person viewing the profile (currentUserId) is following the profile owner.
        (u.is_private = true AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = $2 AND following_id = u.id
        )) OR

        -- Condition 3: Or, if the profile is private, always show posts
        -- to the owner of the profile.
        u.id = $2
      )
    ORDER BY p.created_at DESC;
  `;
  const { rows } = await db.query(query, [username, currentUserId]);
  return rows;
};


export const updateUserProfileInDB = async (userId: string, data: { name?: string; bio?: string; avatar_url?: string }): Promise<PublicUser> => {
  const { name, bio, avatar_url } = data;
  
  const query = `
    UPDATE users
    SET 
      name = COALESCE($1, name),
      bio = COALESCE($2, bio),
      avatar_url = COALESCE($3, avatar_url),
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, username, name, email, role, avatar_url, bio;
  `;

  const { rows } = await db.query(query, [name, bio, avatar_url, userId]);
  return rows[0];
};

export const getFollowersFromDB = async (username: string, currentUserId?: string): Promise<PublicUser[]> => {
  const query = `
    SELECT u.id, u.username, u.name, u.avatar_url,
           EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) as is_following
    FROM users u
    JOIN follows f ON u.id = f.follower_id
    WHERE f.following_id = (SELECT id FROM users WHERE username = $1);
  `;
  const { rows } = await db.query(query, [username, currentUserId]);
  return rows;
};

export const getFollowingFromDB = async (username: string, currentUserId?: string): Promise<PublicUser[]> => {
  const query = `
    SELECT u.id, u.username, u.name, u.avatar_url,
           EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) as is_following
    FROM users u
    JOIN follows f ON u.id = f.following_id
    WHERE f.follower_id = (SELECT id FROM users WHERE username = $1);
  `;
  const { rows } = await db.query(query, [username, currentUserId]);
  return rows;
};

export const getRandomUsersFromDB = async (userId: string, limit: number = 10): Promise<PublicUser[]> => {
  const query = `
    SELECT id, username, name, avatar_url,
           false as is_following -- They are not being followed by default
    FROM users
    WHERE id != $1 AND id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = $1
    )
    ORDER BY RANDOM() -- This selects users randomly
    LIMIT $2;
  `;
  const { rows } = await db.query(query, [userId, limit]);
  return rows;
};

