import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import emailMiddleware from "../middlewares/email.middleware.js";
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

router.post("/signup", emailMiddleware, registerUser);
router.post("/login", emailMiddleware, loginUser);
router.get("/user/:id", getUserById);


router.get("/current", authMiddleware, getCurrentUser);
router.put("/update", authMiddleware, updateUser);
router.post("/logout", authMiddleware, logoutUser);
router.get('/admin/all',authMiddleware, getAllUsers);


export default router;
