import { Request,Response } from "express";
import { db } from "../../config/db";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const getCommentsforPost = async (req: AuthRequest,res: Response) =>{
const {id : postId} = req.params;

try{
    const query = `
      SELECT c.*, json_build_object('id', u.id, 'username', u.username, 'name', u.name, 'avatar_url', u.avatar_url) as author
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC;
    `;

    const {rows} = await db.query(query,[postId]);
    res.status(200).json(rows)
    }
    catch(error){
        res.status(500).json({message:"Server: error fetching comments for post"})
    }
}

export const createComment = async (req: AuthRequest, res: Response) => {
  const { id : postId } = req.params;
  const { content_text } = req.body;
  const userId = req.user?.id;

  if (!content_text) {
    return res.status(400).json({ message: 'Comment content cannot be empty' });
  }

  try {
    const newCommentQuery = 'INSERT INTO comments (post_id, user_id, content_text) VALUES ($1, $2, $3) RETURNING id, created_at';
    const newCommentResult = await db.query(newCommentQuery, [postId, userId, content_text]);
    const { id, created_at } = newCommentResult.rows[0];

    const authorQuery = `SELECT json_build_object('id', id, 'username', username, 'name', name, 'avatar_url', avatar_url) as author FROM users WHERE id = $1`;
    const authorResult = await db.query(authorQuery, [userId]);

    const newComment = {
      id,
      post_id: postId,
      user_id: userId,
      content_text,
      created_at,   
      author: authorResult.rows[0].author
    };

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};