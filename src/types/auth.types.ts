export interface RegisterData {
  username: string;
  name?: string | null;
  email: string;
  password: string;
  avatar_url?: string; 
}

export interface LoginData {
    email: string;
    password: string;
}