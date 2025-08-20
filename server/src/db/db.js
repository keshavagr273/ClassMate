import { Sequelize } from "sequelize";
import asyncHandler from "../utils/asyncHandler.js";
import dotenv from "dotenv";
dotenv.config();

// Database Connection using URI
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Supabase requires SSL
    },
    family: 4, // 👈 Force IPv4 to fix ENETUNREACH on Render
  },
  pool: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
});

// Connect to Database
export const connectDb = asyncHandler(async () => {
  await sequelize.authenticate();
  console.log("Database Connection has been established successfully.");
});

export default sequelize;
