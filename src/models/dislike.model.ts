import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Post from './post.model';
import { CONFIG } from '../constants/constants';

interface DislikeAttributes {
  id: string;
  user_id: string;
  post_id: string;
}

interface DislikeCreationAttributes extends Optional<DislikeAttributes, 'id'> {}

class Dislike extends Model<DislikeAttributes, DislikeCreationAttributes> implements DislikeAttributes {
  public id!: string;
  public user_id!: string;
  public post_id!: string;
}

Dislike.init({
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
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Post,
      key: 'id',
    },
  },
}, {
  sequelize,
  tableName: CONFIG.TABLE_NAMES.DISLIKES,
  timestamps: true,
underscored: true,
});

export default Dislike;
