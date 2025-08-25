export interface CommentType {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  likesCount: number;
  repliesCount: number;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content?: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    profileImage?: string;
  };
  postId: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  replies?: CommentResponse[];
}

export interface CommentQuery {
  postId?: string;
  authorId?: string;
  parentCommentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'likesCount';
  sortOrder?: 'asc' | 'desc';
}
