import { DataTypes, Model,Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";
import Post from "./post.model";

interface CommentAttributes {
    id: string;
    user_id: string;
    post_id: string;
    content_text: string;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id'> {}

class Comment extends Model<CommentAttributes , CommentCreationAttributes> implements CommentAttributes {
  public id!: string;
  public user_id!: string;
  public post_id!: string;
  public content_text!: string;
}

Comment.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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

export default Comment;
