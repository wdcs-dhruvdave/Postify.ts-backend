import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
  process.env.DB_DATABASE!, 
  process.env.DB_USER!,     
  process.env.DB_PASSWORD!, 
  {
    host: process.env.DB_HOST,
    dialect: 'postgres', 
    logging: false, 
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

export default sequelize;