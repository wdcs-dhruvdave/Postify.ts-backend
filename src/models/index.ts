import User from "./user.model";
import Post from "./post.model";
import Like from "./like.model";
import Dislike from "./dislike.model";
import Comment from "./comment.model";
import Category from "./category.model";
import Follow from "./follow.model";

// Chat models
import Message from "./message.model";
import Participant from "./participate.model";
import Conversation from "./conversation.model";

// ----- User associations -----
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
User.hasMany(Dislike, { foreignKey: 'user_id', as: 'dislikes' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'followers' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'following' });

// Chat associations
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sent_messages' });
User.hasMany(Participant, { foreignKey: 'user_id', as: 'participations' });

// ----- Post associations -----
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
Post.hasMany(Dislike, { foreignKey: 'post_id', as: 'dislikes' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

// ----- Category associations -----
Category.hasMany(Post, { foreignKey: 'category_id', as: 'posts' });

// ----- Comment associations -----
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// ----- Like associations -----
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// ----- Dislike associations -----
Dislike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Dislike.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// ----- Follow associations -----
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'following' });

// ----- Chat associations -----
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

Participant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Participant.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Conversation.hasMany(Participant, { foreignKey: 'conversation_id', as: 'participants' });
Conversation.belongsToMany(User, { through: Participant, foreignKey: 'conversation_id', otherKey: 'user_id', as: 'users' });

// ----- Export all models -----
export {
  User,
  Post,
  Like,
  Dislike,
  Comment,
  Category,
  Follow,
  Message,
  Participant,
  Conversation
};
