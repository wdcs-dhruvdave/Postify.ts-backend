import { Request, Response } from "express";
import { db } from "../../config/db";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  let { title, content_text, image_url, category_id } = req.body;

  if (!title || !content_text) {
    return res.status(400).json({
      message: "Title and content are required",
    });
  }

  try {
    if (!category_id) {
      const generalCategoryQuery = "SELECT id FROM categories WHERE slug = 'general' LIMIT 1";
      const { rows } = await db.query(generalCategoryQuery);
      
      if (rows.length === 0) {
        return res.status(400).json({ message: "Default 'General' category not found." });
      }
      category_id = rows[0].id; 
    }

    const newPostQuery = `
      INSERT INTO posts (user_id, category_id, title, content_text, image_url, is_published)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await db.query(newPostQuery, [
      req.user?.id,
      category_id, 
      title,
      content_text,
      image_url,
      true,
    ]);

    const newPost = result.rows[0];

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      message: "Server error during post creation.",
    });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try{
            const query = `
      SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'name', u.name,
          'avatar_url', u.avatar_url
        ) as author,
        COALESCE(l.likes_count, 0)::int as likes_count,
        COALESCE(d.dislikes_count, 0)::int as dislikes_count,
        COALESCE(c.comments_count, 0)::int as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT post_id, count(*) as likes_count FROM likes GROUP BY post_id
      ) l ON p.id = l.post_id
      LEFT JOIN (
        SELECT post_id, count(*) as dislikes_count FROM dislikes GROUP BY post_id
      ) d ON p.id = d.post_id
      LEFT JOIN (
        SELECT post_id, count(*) as comments_count FROM comments GROUP BY post_id
      ) c ON p.id = c.post_id
      WHERE p.is_published = true
      ORDER BY p.created_at DESC;
    `;

    const result = await db.query(query);
    const posts = result.rows;
    return res.status(200).json({
        message: "Posts retrieved successfully",
        posts,
    });
    }
    catch (error) {
        console.error("Error retrieving posts:", error);
        return res.status(500).json({
            message: "Server error during post retrieval.",
        });
    }
}