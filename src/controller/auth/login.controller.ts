import { Request,Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {db} from "../../config/db"


export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const UserQuery = `SELECT * FROM users WHERE email = $1`
        const result = await db.query(UserQuery, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password || '');
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string || '', { expiresIn: '1d' });
        return res.status(200).json({
            message: "Login successful",
            token,
            user:{
                    id: user.id,
                    username: user.username,
                    name: user.name || null,
                    email: user.email,
                    role: user.role,
            }
  
        });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error during login.' });
        }
}