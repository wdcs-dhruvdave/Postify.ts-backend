import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ParticipantAttributes {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: Date;
}

interface ParticipantCreationAttributes extends Optional<ParticipantAttributes, 'id' | 'joined_at'> {}

class Participant extends Model<ParticipantAttributes, ParticipantCreationAttributes> implements ParticipantAttributes {
  public id!: string;
  public conversation_id!: string;
  public user_id!: string;
  public joined_at!: Date;
}

Participant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'participants',
    timestamps: false,
    underscored: true,
  }
);

export default Participant;
