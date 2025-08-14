import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterData, LoginData } from '../types/auth.types';
import { UserAttributes } from "../models/user.model";
import { User } from "../models/index";

const DEFAULT_AVATAR = `https://api.dicebear.com/8.x/initials/svg?seed=default`;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export const registerUserService = async (
  data: RegisterData
): Promise<Omit<UserAttributes, 'password'>> => {
  const { username, name, email, password, avatar_url } = data;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    name: name || 'anonymous',
    email: email.toLowerCase(),
    password: hashedPassword,
    avatar_url: avatar_url || `https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg`,
  });

  const { password: _, ...safeUser } = newUser.toJSON();
  return safeUser;
};

export const loginUserService = async (
  data: LoginData
): Promise<{ token: string; user: Omit<UserAttributes, 'password'> }> => {
  const { email, password } = data;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

  const { password: _, ...safeUser } = user.toJSON();
  return { token, user: safeUser };
};
