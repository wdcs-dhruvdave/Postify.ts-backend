import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ActivityType, CONFIG } from '../constants/constants';

interface UserActivityLogAttributes {
  id: number;
  userId: string;
  activityType: string;
  targetId?: string | null;
  targetCategoryId?: string | null;
  createdAt?: Date;
}

interface UserActivityLogCreationAttributes
  extends Optional<UserActivityLogAttributes, 'id' | 'targetId' | 'targetCategoryId' | 'createdAt'> {}

class UserActivityLog
  extends Model<UserActivityLogAttributes, UserActivityLogCreationAttributes>
  implements UserActivityLogAttributes
{
  public id!: number;
  public userId!: string;
  public activityType!: string;
  public targetId!: string | null;
  public targetCategoryId!: string | null;
  public createdAt!: Date;
}

UserActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    activityType: {
      type: DataTypes.ENUM(...Object.values(ActivityType)),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    targetCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: CONFIG.TABLE_NAMES.USER_ACTIVITY_LOGS,
    underscored: true,
    timestamps: true,
    updatedAt: false, 
  }
);

export default UserActivityLog;
