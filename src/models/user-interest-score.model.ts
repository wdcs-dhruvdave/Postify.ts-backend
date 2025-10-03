import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Category from './category.model';

export interface UserInterestScoreAttributes {
  id: string;
  user_id: string;
  category_id: string;
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserInterestScoreCreationAttributes 
  extends Optional<UserInterestScoreAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserInterestScore 
  extends Model<UserInterestScoreAttributes, UserInterestScoreCreationAttributes> 
  implements UserInterestScoreAttributes {
  public id!: string;
  public user_id!: string;
  public category_id!: string;
  public score!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserInterestScore.init({
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
  score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'user_interest_scores',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'category_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['score']
    }
  ]
});

export default UserInterestScore;
