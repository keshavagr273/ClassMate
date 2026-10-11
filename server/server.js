import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { initializeAssociations } from "./src/models/association.js";

import sequelize from "./src/db/db.js";

import userRoutes from "./src/routes/user.routes.js";
import lostAndFoundRoutes from "./src/routes/lostandfound.routes.js";
import buyAndSellRoutes from "./src/routes/buyandsell.routes.js";
import ridesRoutes from "./src/routes/ride.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import enrollmentRoutes from "./src/routes/enrollment.routes.js"
import attendanceRoutes from "./src/routes/attendance.routes.js"
import skillExchangeRoutes from './src/routes/skillExchange.routes.js';
import internshipRoutes from './src/routes/internship.routes.js';
import performanceMiddleware from './src/middlewares/performance.middleware.js';
import metrics from './src/utils/metrics.js';
import authMiddleware from './src/middlewares/auth.middleware.js';
import requireAdmin from './src/middlewares/requireAdmin.middleware.js';
import apiLimiter from './src/middlewares/rateLimit.middleware.js';


dotenv.config({ path: "./.env" });
const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://classmate-frontend.onrender.com",
    "https://class-matefrontend.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id", ""],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Set X-Content-Type-Options header for all responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Performance monitoring
app.use(performanceMiddleware);

// Set Cache-Control header for all API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Blanket rate limit across the API. Per-route limiters (auth, scraping) are
// tighter and are applied in their own routers.
app.use('/api', apiLimiter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Performance metrics endpoint — protected: admin only
app.get("/api/metrics", authMiddleware, requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: metrics.getStats(),
    message: "Performance metrics retrieved successfully"
  });
});


// Use routes
app.use("/api/users", userRoutes);
app.use("/api/lost-and-found", lostAndFoundRoutes);
app.use("/api/buy-and-sell", buyAndSellRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use('/api/skill-exchange', skillExchangeRoutes);
app.use('/api/internships', internshipRoutes);

app.use((err, req, res, next) => {
  if (err && err.statusCode === 401) {
    // Suppress stack trace for 401 errors
    res.status(401).json({
      status: 'error',
      code: 401,
      message: err.message || 'Not authenticated',
      data: null,
      success: false
    });
  } else {
    // Log all other errors as usual
    console.error(err);
    res.status(err.statusCode || 500).json({
      status: 'error',
      code: err.statusCode || 500,
      message: err.message || 'Internal Server Error',
      data: null,
      success: false
    });
  }
});

import { connectDb } from "./src/db/db.js";


const startServer = async () => {
  try {
    console.log("Initializing associations...");
    initializeAssociations();
    console.log("Associations initialized!");
    
    console.log("Connecting to database...");

    /* Schema sync is now opt-in via DB_SYNC=alter (or DB_SYNC=force).
     *
     * This previously ran `sync({ alter: true })` on every boot whenever
     * NODE_ENV !== "production". That is not idempotent: each run diffs the
     * models against the live schema and emits ALTER statements, and it
     * eventually tried to DROP CONSTRAINT "BuyAndSells_userId_fkey" after an
     * earlier run had already removed it. Postgres rejected the statement,
     * startServer threw, and the process exited — the app could no longer
     * boot at all against its own database.
     *
     * It is also pointed at a hosted database, so every local `npm run dev`
     * was mutating the real schema. Default to verifying the connection only;
     * opt in deliberately when models actually change.
     */
    const syncMode = (process.env.DB_SYNC || "").toLowerCase();
    if (syncMode === "alter" || syncMode === "force") {
      console.warn(
        `DB_SYNC=${syncMode} — altering the live schema to match the models.`
      );
      await sequelize.sync({ [syncMode]: true });
      console.log("Database schema synced.");
    } else {
      await sequelize.authenticate();
      console.log("Database connection authenticated.");
    }
    await connectDb();
    console.log("Database connected successfully");

    const httpServer = createServer(app);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};


process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // In production, exit so the process manager (PM2/Docker) can restart cleanly.
  // In development, log only to avoid disrupting the dev loop.
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});


startServer();
