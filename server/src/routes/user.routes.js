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
  getAllUsers
} from "../controllers/user.controller.js";

const router = express.Router();

/*
=======================================================================
        Public Routes
=======================================================================
*/


router.post("/signup", emailMiddleware, registerUser);
router.post("/login", emailMiddleware, loginUser);
// router.post("/google-auth",emailMiddleware, googleAuth);


// router.get("/verify-email", verifyEmail);

router.get("/user/:id", getUserById);

/*
=======================================================================
        Protected Routes
=======================================================================
*/

router.get("/current", authMiddleware, getCurrentUser);
router.put("/update", authMiddleware, updateUser);
router.post("/logout", authMiddleware, logoutUser);

// --- Admin Only Route ---
router.get('/admin/all',authMiddleware, getAllUsers);


export default router;
