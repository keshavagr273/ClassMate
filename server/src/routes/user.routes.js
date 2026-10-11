import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import emailMiddleware from "../middlewares/email.middleware.js";
import requireAdmin from "../middlewares/requireAdmin.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import User from "../models/user.model.js"
import {
  getCurrentUser,
  updateUser,
  logoutUser,
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  checkDatabaseHealth
} from "../controllers/user.controller.js";

const router = express.Router();

// Health check route
router.get("/health", checkDatabaseHealth);

router.post("/signup", authLimiter, emailMiddleware, registerUser);
router.post("/login", authLimiter, emailMiddleware, loginUser);

// Was public: anyone could walk /users/user/1,2,3... and read every account's
// name, email, branch, semester, hostel and registration number.
router.get("/user/:id", authMiddleware, getUserById);


router.get("/current", authMiddleware, getCurrentUser);
router.put("/update", authMiddleware, updateUser);
router.post("/logout", authMiddleware, logoutUser);
router.get('/admin/all', authMiddleware, requireAdmin, getAllUsers);


export default router;
