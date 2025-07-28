import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import { PublicUser } from '../types/user.types'; 
import { RegisterData, LoginData } from '../types/auth.types';

export const registerUserService = async (data: RegisterData): Promise<PublicUser> => {
    const { username, name, email, password } = data;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserQuery = `
    INSERT INTO users (username, name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, name, email, role, created_at;
    `;

    const result = await db.query(newUserQuery, [username, name || null, email, hashedPassword]);
    return result.rows[0];
};

export const loginUserService = async (data: LoginData): Promise<{ token: string, user: PublicUser }> => {
    const { email, password } = data;

    const userQuery = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(userQuery, [email]);
    const user = result.rows[0];

    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string || '', { expiresIn: '1d' });
    
    delete user.password;

    return { token, user };
};