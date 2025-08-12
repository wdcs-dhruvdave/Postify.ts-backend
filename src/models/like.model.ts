import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";
import Post from "./post.model";

interface LikeAttributes {
    id: string;
    user_id: string;
    post_id: string;
}

interface LikeCreationAttributes extends Optional<LikeAttributes, 'id'> {}

class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
    public id!: string;
    public user_id!: string;
    public post_id!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Like.init({
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
    tableName: 'likes',
    timestamps: true,
});

export default Like;
