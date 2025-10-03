import { Post } from "../models";
import { PostAttributes } from "../models/post.model";

export interface PostCategoryData {
  category_id: string;
}


export const getPostCategoryById = async (postId: string): Promise<PostCategoryData | null> => {
  const post = await Post.findByPk(postId, {
    attributes: ["category_id"],
  });
  
  if (!post) {
    return null;
  }
  
  return {
    category_id: post.category_id,
  };
};

export const getPostById = async (postId: string): Promise<PostAttributes | null> => {
  const post = await Post.findByPk(postId);
  
  if (!post) {
    return null;
  }
  
  return post.toJSON() as PostAttributes;
};


export const getPostByIdWithAttributes = async (
  postId: string, 
  attributes: (keyof PostAttributes)[]
): Promise<Partial<PostAttributes> | null> => {
  const post = await Post.findByPk(postId, {
    attributes,
  });
  
  if (!post) {
    return null;
  }
  
  return post.toJSON() as Partial<PostAttributes>;
};
