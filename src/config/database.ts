import { Sequelize } from "sequelize";
import 'dotenv/config';
import { ENV } from "../constants/constants";

const sequelize = new Sequelize(
  ENV.DB_DATABASE!,
  ENV.DB_USER!,
  ENV.DB_PASSWORD!,
  {
    host: ENV.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the PostgreSQL database:", error);
  }
};

export default sequelize;