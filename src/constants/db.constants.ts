export const DB = {
  MONGO_URI: "mongodb://127.0.0.1:27017/postify_notifications",
  MONGO_SERVER_SELECTION_TIMEOUT_MS: 5000,
  DIALECT: 'postgres',
  TABLE_NAMES: {
    USER: 'users',
    POST: 'posts',
    COMMENT: 'comments',
    LIKE: 'likes',
    DISLIKE: 'dislikes',
    FOLLOW: 'follows',
    CATEGORY: 'categories',
    CONVERSATION: 'conversations',
    MESSAGE: 'messages',
    PARTICIPANT: 'participants',
    USER_ACTIVITY_LOG: 'user_activity_logs',
  }
};