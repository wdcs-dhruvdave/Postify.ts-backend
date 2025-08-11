import { PublicUser } from './user.types';

export interface Post {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  content_text: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  author: PublicUser;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
  user_has_disliked?: boolean;
}

export interface CreatePostData {
  title: string;
  content_text?: string | null;
  image_url?: string | null;
  category_id?: string;
}

export interface Category {
  id: string;
  name: string;
}