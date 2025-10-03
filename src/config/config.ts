import dotenv from 'dotenv';
import { ENV } from '../constants/constants';

dotenv.config();

const sqldb = {
  user: ENV.DB_USER,
  host: ENV.DB_HOST,
  database: ENV.DB_DATABASE,
  password: ENV.DB_PASSWORD,
  port: ENV.DB_PORT,
  dialect: 'postgres',
};

export default sqldb;