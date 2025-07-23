export type Post = {
  id: string;
  author: PostAuthor;
  content_text: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
};