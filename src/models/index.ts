import User from "./user.model";
import Post from "./post.model";
import Like from "./like.model";
import Dislike from "./dislike.model";
import Comment from "./comment.model";
import Category from "./category.model";
import Follow from "./follow.model";

User.hasMany(Post,{foreignKey:'user_id', as: 'posts'});
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
User.hasMany(Dislike, { foreignKey: 'user_id', as: 'dislikes' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'followers' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'following' });  

Post.belongsTo(User, { foreignKey: 'user_id' , as: 'author'});
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
Post.hasMany(Dislike, { foreignKey: 'post_id', as: 'dislikes' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

Category.hasMany(Post,{ foreignKey:'category_id', as: 'posts'});

Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

Dislike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Dislike.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'following' });

export {
  User,
  Post,
  Like,
  Dislike,
  Comment,
  Category,
  Follow,
};
