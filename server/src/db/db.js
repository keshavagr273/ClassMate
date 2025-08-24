import { Sequelize } from "sequelize";
import asyncHandler from "../utils/asyncHandler.js";
import dotenv from "dotenv";
dotenv.config();

// Database Connection - Support both DATABASE_URL and individual variables
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
} else {
  // Use individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME || "postgres",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === "true" ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
        family: 4,
      },
      pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Connect to Database
export const connectDb = asyncHandler(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connection has been established successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Errno:", error.errno);
    throw error;
  }
});

export default sequelize;
