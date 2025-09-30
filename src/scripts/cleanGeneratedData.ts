import { program } from "commander";
import { Sequelize } from "sequelize";
import { ENV } from "../constants/constants";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: "postgres",
});

const cleanDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection has been established successfully.");

    const results: any = await sequelize.query(
      "SELECT current_database()",
      { type: "SELECT" }
    );

    if (results[0].current_database !== ENV.DB_DATABASE) {
      console.error(`❌ DANGER: Script is connected to "${results[0].current_database}", but your .env file specifies "${ENV.DB_DATABASE}". Aborting clean.`);
      return;
    }

    console.log(`🗑️  Cleaning database: ${ENV.DB_DATABASE}...`);
    await sequelize.query(`DROP SCHEMA public CASCADE;`);
    await sequelize.query(`CREATE SCHEMA public;`);
    console.log("✅ Database cleaned successfully.");

  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
};

program.command("clean:db").description("Clean the database").action(cleanDB);

program.parse(process.argv);
