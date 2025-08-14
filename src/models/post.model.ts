import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Category from './category.model';

export interface PostAttributes {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  content_text: string | null;
  image_url: string | null;
  is_published: boolean;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'content_text' | 'image_url' | 'is_published'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public user_id!: string;
  public category_id!: string;
  public title!: string;
  public content_text!: string | null;
  public image_url!: string | null;
  public is_published!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User, 
      key: 'id',
    },
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Category, 
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'posts',
  timestamps: true,
  underscored: true,
});

export default Post;
