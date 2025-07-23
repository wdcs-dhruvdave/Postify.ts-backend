export type UserRole = 'admin' | 'user';

export interface User {
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
}