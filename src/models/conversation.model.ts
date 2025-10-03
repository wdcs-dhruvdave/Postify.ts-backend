import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CONFIG } from '../constants/constants';

export interface ConversationAttributes {
  id: string;
  title: string | null;
  is_group: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'title' | 'createdAt' | 'updatedAt'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public title!: string | null;
  public is_group!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: CONFIG.TABLE_NAMES.CONVERSATIONS,
    timestamps: true,
    underscored: true,
  }
);

export default Conversation;
