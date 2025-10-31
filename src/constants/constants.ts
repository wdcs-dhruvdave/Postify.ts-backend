export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum ActivityType {
  POST_LIKE = 'post_like',
  POST_UNLIKE = 'post_unlike',
  POST_DISLIKE = 'post_dislike',
  POST_UNDISLIKE = 'post_undislike',
  POST_VIEW = 'post_view',
  POST_SHARE = 'post_share',
  PROFILE_VIEW = 'profile_view',
  COMMENT = 'comment',
  COMMENT_LIKE = 'comment_like',
  FOLLOW = 'follow',
}

export enum NotificationType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  COMMENT = 'comment',
  FOLLOW = 'follow',
}

export const CONFIG = {
  SERVER_PORT: 4000,
  API_PREFIX: '/api',
  AUTH: {
    BEARER_PREFIX: 'Bearer ',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 15,
    SEARCH_LIMIT: 10,
    SUGGESTION_LIMIT: 5,
  },
  NOTIFICATION: {
    LIMIT: 20,
    SORT_ORDER: -1, 
    MODEL_NAME: 'Notification',
  },
  AVATAR: {
    DEFAULT_DICEBEAR: `https://api.dicebear.com/8.x/initials/svg?seed=default`,
    DEFAULT_WIKIMEDIA: `https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg`,
  },
  SEED: {
    NUM_USERS: 50,
    POSTS_PER_USER: 10,
    FOLLOWS_PER_USER: 15,
  },
  POST: {
    MEDIA_SIZE_LIMIT: 50 * 1024 * 1024, // 50 MB
  },
  REGEX: {
    BASE64_IMAGE_VIDEO: /^data:(image|video)\/[a-zA-Z0-9.+-]+;base64,/,
  },
  LOGGER: {
    LEVEL: 'info',
    DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  },
  TABLE_NAMES: {
    USER_ACTIVITY_LOGS: 'user_activity_logs',
    CATEGORIES: 'categories',
    COMMENTS: 'comments',
    CONVERSATIONS: 'conversations',
    DISLIKES: 'dislikes',
    FOLLOWS: 'follows',
    LIKES: 'likes',
    MESSAGES: 'messages',
    PARTICIPANTS: 'participants',
    POSTS: 'posts',
    USERS: 'users',
  },
  EVENTS: {
    LOG_ACTIVITY: 'log_activity',
  },
  ONE_MINUTE_IN_MS: 10 * 60 * 1000,
  
  FCM: {
    WEBPUSH: {
      ICON: '/favicon.ico',
      BADGE: '/favicon.ico',
      REQUIRE_INTERACTION: true,
    },
    DEFAULTS: {
      FALLBACK_URL: '/',
      TEST_TITLE: 'Test Notification',
      TEST_BODY: 'Your notifications are working correctly.',
      DRY_RUN: true,
    },
    ERROR_CODES: {
      INVALID_REGISTRATION_TOKEN: 'messaging/invalid-registration-token',
      REGISTRATION_TOKEN_NOT_REGISTERED: 'messaging/registration-token-not-registered',
    },
    TIMEOUT: 5000,
  },
};

export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET || '63ekHvEI7Na2hmnOYjqZEtv27kMkXmMJ', // will change later cunntly giving error using env
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  DB_USER: process.env.DB_USER || 'postify_user',
  DB_PASSWORD: process.env.DB_PASSWORD || '123456',
  DB_DATABASE: process.env.DB_DATABASE || 'postify_db',
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/postify_notifications",
  MONGO_SERVER_SELECTION_TIMEOUT_MS: process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS ? Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) : 5000,
};

export const ROUTES = {
  AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    LOGIN: '/login',
  },
  USERS: {
    BASE: '/users',
    SEARCH: '/search',
    SUGGESTIONS: '/suggestions',
    PROFILE: '/profile',
    PROFILE_PRIVACY: '/profile/privacy',
    EXPLORE_SUGGESTIONS: '/explore/suggestions',
  },
  POSTS: {
    BASE: '/posts',
    FEED: '/feed',
    RECOMMENDED: '/recommended',
    CATEGORIES: '/categories',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: '/read',
  },
};


export const MESSAGES = {
  COMMON: {
    SERVER_ERROR: 'A server error occurred. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION_ERROR: 'Validation Error: One or more fields are invalid.',
  },
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully.',
    LOGIN_SUCCESS: 'Login successful.',
    NO_TOKEN_PROVIDED: 'Unauthorized: No authentication token provided.',
    INVALID_TOKEN: 'Unauthorized: The provided token is invalid or has expired.',
    EMAIL_EXISTS: 'This email address is already in use.',
    USERNAME_EXISTS: 'This username is already taken.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    INVALID_PASSWORD: 'Invalid password',
  },
  USER: {
    NOT_FOUND: 'User not found.',
    CANNOT_FOLLOW_SELF: 'You cannot follow yourself.',
    ALREADY_FOLLOWING: 'You are already following this user.',
    FOLLOW_SUCCESS: 'User followed successfully.',
    UNFOLLOW_SUCCESS: 'User unfollowed successfully.',
    PROFILE_UPDATED_SUCCESS: 'Profile updated successfully.',
    PRIVACY_UPDATED_SUCCESS: 'Privacy setting updated successfully.',
    INVALID_PRIVACY_VALUE: 'Invalid is_private value provided. It must be a boolean.',
  },
  POST: {
    NOT_FOUND: 'Post not found.',
    CREATED_SUCCESS: 'Post created successfully.',
    UPDATED_SUCCESS: 'Post updated successfully.',
    DELETED_SUCCESS: 'Post deleted successfully.',
    LIKED_SUCCESS: 'Post liked successfully.',
    LIKE_REMOVED_SUCCESS: 'Like removed successfully.',
    DISLIKED_SUCCESS: 'Post disliked successfully.',
    DISLIKE_REMOVED_SUCCESS: 'Dislike removed successfully.',
    CATEGORY_NOT_FOUND: 'The specified category was not found.',
  },
  COMMENT: {
    EMPTY_CONTENT: 'Comment content cannot be empty.',
    UNAUTHORIZED_USER_ID_NOT_FOUND: 'Unauthorized: User ID not found.',
    SERVER_ERROR_CREATING_COMMENT: 'Server error creating comment.',
    SERVER_ERROR_FETCHING_COMMENTS: 'Server error: fetching comments for post.',
  },
  NOTIFICATION: {
    FETCH_ERROR: 'Server error while fetching notifications.',
    MARK_AS_READ_ERROR: 'Server error while marking notifications as read.',
  },
  VALIDATION: {
    USERNAME_MIN_LENGTH: 'Username must be at least 3 characters long',
    USERNAME_MAX_LENGTH: 'Username must be at most 20 characters long',
    USERNAME_REGEX: 'Username can only contain letters, numbers, and underscores',
    INVALID_EMAIL: 'Invalid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
    PASSWORD_MAX_LENGTH: 'Password must be at most 20 characters long',
    NAME_MIN_LENGTH: 'Name Must Be Longer Than 3 Characters',
    NAME_MAX_LENGTH: 'Name Must Be Less Than 30 Characters',
    PASSWORD_REQUIRED: 'Password is required',
  },
  INVALID_PASSWORD: 'Invalid password',
  INVALID_EMAIL: 'Invalid email',
  INVALID_USERNAME: 'Invalid username',
  INVALID_TOKEN: 'Invalid token',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_PRIVACY_VALUE: 'Invalid is_private value provided. It must be a boolean.',
};
