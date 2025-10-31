console.log("--- LOADING THE LATEST USER MODEL FILE ---");
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole, CONFIG } from '../constants/constants';

export interface UserAttributes {
  id: string;
  username: string;
  name: string | null;
  email: string;
  password: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  is_private: boolean;
  fcm_tokens: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'name' | 'avatar_url' | 'bio' | 'role' | 'is_private' | 'fcm_tokens' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public name!: string | null;
  public email!: string;
  public password!: string;
  public avatar_url!: string | null;
  public bio!: string | null;
  public role!: 'user' | 'admin';
  public is_private!: boolean;
  public fcm_tokens!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, 
      defaultValue: 'anonymous',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(UserRole.USER, UserRole.ADMIN),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fcm_tokens: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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
    tableName: CONFIG.TABLE_NAMES.USERS, 
    timestamps: true, 
    underscored: true,  }
);

export default User;
