import { query } from "winston";
import { db } from "../config/db";
import { PublicUser } from "../types/user.types";
import e from "express";

export interface UserProfile extends PublicUser {
  followers_count: number;
  following_count: number;
}
export const searchUsersInDB = async (query:string, currentUserId:string):Promise<PublicUser[]> => {
    const searchQuery = `
        SELECT id, username, name, avatar_url 
        FROM users 
        WHERE (username ILIKE $1 OR name ILIKE $1) AND id != $2
        LIMIT 10
    `;

    const {rows} = await db.query(searchQuery, [query, currentUserId]);
    return rows;
}

export const getUserProfileFromDB = async (username: string): Promise<UserProfile | null> => {
  const query = `
    SELECT 
      u.id, u.username, u.name, u.avatar_url, u.bio, u.created_at,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count
    FROM users u
    WHERE u.username = $1;
  `;
  const { rows } = await db.query(query, [username]);
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