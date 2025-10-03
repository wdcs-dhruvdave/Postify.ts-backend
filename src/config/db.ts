import { Pool } from 'pg';
import dotenv from 'dotenv';
import { ENV } from '../constants/constants';

dotenv.config();

export const db = new Pool({
  user: ENV.DB_USER,
  host: ENV.DB_HOST,
  database: ENV.DB_DATABASE,
  password: ENV.DB_PASSWORD,
  port: ENV.DB_PORT,
});

