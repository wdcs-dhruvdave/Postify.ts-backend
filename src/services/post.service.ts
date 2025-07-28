import { db } from "../config/db";
import { Post, CreatePostData, Category } from "../types/post.types";

export const createPostInDB = async (userId: string, data: CreatePostData): Promise<Post> => {
    let { title, content_text, image_url, category_id } = data;
    if (!category_id) {
        const cat = await db.query("SELECT id FROM categories WHERE slug = 'general' LIMIT 1");
        if (cat.rows.length === 0) throw new Error("Default 'General' category not found.");
        category_id = cat.rows[0].id;
    }
    const result = await db.query('INSERT INTO posts (user_id, category_id, title, content_text, image_url, is_published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [userId, category_id, title, content_text, image_url, true]);
    const newPostId = result.rows[0].id;
    const fullPostResult = await db.query(`SELECT p.*, json_build_object('id', u.id, 'username', u.username, 'name', u.name, 'avatar_url', u.avatar_url) as author, 0 as likes_count, 0 as dislikes_count, 0 as comments_count FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`, [newPostId]);
    return fullPostResult.rows[0];
};

export const getAllPostsFromDB = async (): Promise<Post[]> => {
    const query = `
      SELECT p.*, json_build_object('id', u.id, 'username', u.username, 'name', u.name, 'avatar_url', u.avatar_url) as author,
      COALESCE(l.likes_count, 0)::int as likes_count, COALESCE(d.dislikes_count, 0)::int as dislikes_count, COALESCE(c.comments_count, 0)::int as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (SELECT post_id, count(*) as likes_count FROM likes GROUP BY post_id) l ON p.id = l.post_id
      LEFT JOIN (SELECT post_id, count(*) as dislikes_count FROM dislikes GROUP BY post_id) d ON p.id = d.post_id
      LEFT JOIN (SELECT post_id, count(*) as comments_count FROM comments GROUP BY post_id) c ON p.id = c.post_id
      WHERE p.is_published = true ORDER BY p.created_at DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
};

export const getFeedFromDB = async (userId: string): Promise<Post[]> => {
    const query = `
      SELECT p.*, json_build_object('id', u.id, 'username', u.username, 'name', u.name, 'avatar_url', u.avatar_url) as author,
      COALESCE(l.likes_count, 0)::int as likes_count, COALESCE(d.dislikes_count, 0)::int as dislikes_count, COALESCE(c.comments_count, 0)::int as comments_count,
      EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as user_has_liked, EXISTS(SELECT 1 FROM dislikes WHERE post_id = p.id AND user_id = $1) as user_has_disliked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (SELECT post_id, count(*) as likes_count FROM likes GROUP BY post_id) l ON p.id = l.post_id
      LEFT JOIN (SELECT post_id, count(*) as dislikes_count FROM dislikes GROUP BY post_id) d ON p.id = d.post_id
      LEFT JOIN (SELECT post_id, count(*) as comments_count FROM comments GROUP BY post_id) c ON p.id = c.post_id
      WHERE p.is_published = true ORDER BY p.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
};

export const likePostInDB = async (userId: string, postId: string): Promise<void> => {
    await db.query('BEGIN');
    await db.query('DELETE FROM dislikes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    await db.query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
    await db.query('COMMIT');
};

export const unlikePostInDB = async (userId: string, postId: string): Promise<void> => {
    await db.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
};

export const dislikePostInDB = async (userId: string, postId: string): Promise<void> => {
    await db.query('BEGIN');
    await db.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    await db.query('INSERT INTO dislikes (user_id, post_id) VALUES ($1, $2)', [userId, postId]);
    await db.query('COMMIT');
};

export const undislikePostInDB = async (userId: string, postId: string): Promise<void> => {
    await db.query('DELETE FROM dislikes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
};

export const getCategoriesFromDB = async (): Promise<Category[]> => {
    const { rows } = await db.query('SELECT id, name FROM categories ORDER BY name');
    return rows;
};