import { Request,Response } from "express";
import bcrypt from "bcryptjs";
import {db} from "../../config/db"

export const registerUser = async (req: Request, res: Response) => {
    const { username,name,email,password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message: "Username, email, and password are required"
        })
    }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserQuery = `
        INSERT INTO users (username, name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, name, email, role, created_at;
        `;

        const result = await db.query(newUserQuery, [username, name || null, email, hashedPassword]);
        const newUser = result.rows[0];

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });
    }
    catch (error) {
    if ((error as any).code === '23505') {
      const detail = (error as any).detail || '';
      if (detail.includes('email')) {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      if (detail.includes('username')) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
    }

    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};