import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { initializeAssociations } from "./src/models/association.js";

// Import all models so Sequelize knows about them before syncing
import "./src/models/association.js";
import "./src/models/attendance_record.model.js";
import "./src/models/buyandsell.model.js";
// import "./src/models/chat.model.js"; // This file was deleted
// import "./src/models/contact.model.js";
// import "./src/models/eateries.model.js";
// import "./src/models/events.model.js"; // This file was deleted
// import "./src/models/hostels.model.js";
import "./src/models/lostandfound.model.js";
import "./src/models/notification.model.js";
// Removed: import "./src/models/resources.model.js";
import "./src/models/ride.model.js";
import "./src/models/rideParticipant.model.js";
import "./src/models/role.model.js";
import "./src/models/subject.model.js";
import "./src/models/user.model.js";
import "./src/models/user_subject.model.js";

import sequelize from "./src/db/db.js";

// Import routes
import userRoutes from "./src/routes/user.routes.js";
// Removed: import contactRoutes from "./src/routes/contact.routes.js";
import lostAndFoundRoutes from "./src/routes/lostandfound.routes.js";
import buyAndSellRoutes from "./src/routes/buyandsell.routes.js";
// import eateriesRoutes from "./src/routes/eateries.routes.js";
import ridesRoutes from "./src/routes/ride.routes.js";
// Removed: import resourcesRoutes from "./src/routes/resources.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
// import chatBotRoutes from "./src/routes/chatBot.routes.js";
import enrollmentRoutes from "./src/routes/enrollment.routes.js"
import attendanceRoutes from "./src/routes/attendance.routes.js"
import skillExchangeRoutes from './src/routes/skillExchange.routes.js';
import internshipRoutes from './src/routes/internship.routes.js';

dotenv.config({ path: "./.env" });
const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://classmate-frontend.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id", ""],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));


// Test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/lost-and-found", lostAndFoundRoutes);
app.use("/api/buy-and-sell", buyAndSellRoutes);
app.use("/api/rides", ridesRoutes);
// app.use("/api/eateries", eateriesRoutes);
app.use("/api/notification", notificationRoutes);
// app.use("/api/chatbot", chatBotRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use('/api/skill-exchange', skillExchangeRoutes);
app.use('/api/internships', internshipRoutes);

import { connectDb } from "./src/db/db.js";


const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await sequelize.sync({ alter: true });
    console.log("Database & tables have been updated!");
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

initializeAssociations();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer();
