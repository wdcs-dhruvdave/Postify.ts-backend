import { UserRole } from "../constants/constants";

export interface PublicUser {
    id: string;
    username: string;
    name: string | null; 
    email: string;
    password?: string;
    avatar_url: string | null;
    bio: string | null;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
    is_following?: boolean;
    is_followed_by?: boolean;
}


export type SequelizeUserAttributes = (string | [any, string])[];


export interface BasicUserAttributes {
    id: string;
    username: string;
    name: string;
    avatar_url: string;
}

export interface UserWithTimestamps extends BasicUserAttributes {
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithFollowStatus extends UserWithTimestamps {
    is_following?: boolean;
}
