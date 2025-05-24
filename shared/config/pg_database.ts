import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const url = String(process.env.PG_DATABASE_URL);

const sequelize = new Sequelize(url, {
  dialect: "postgres",
  logging: console.log,
});

export default sequelize;
