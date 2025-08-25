import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Post from './post.model';

export interface CommentAttributes {
  id: string;
  user_id: string;
  post_id: string;
  parent_id: string | null; 
  content_text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'parent_id' | 'createdAt' | 'updatedAt'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: string;
  public user_id!: string;
  public post_id!: string;
  public parent_id!: string | null; 
  public content_text!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Post, key: 'id' },
  },

  parent_id: {
    type: DataTypes.UUID,
    allowNull: true, 
    references: {
      model: 'comments', 
      key: 'id',
    },
  },
  content_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'comments',
  timestamps: true,
  underscored: true,
});


Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parent_id' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parent_id' });

export default Comment;
