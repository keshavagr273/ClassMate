import User from "../models/user.model.js";
import { Role, UserRole } from "../models/role.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.CLIENT_URL)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/*
=============================
        Time and Date  
=============================
*/
const getCurrentUTCDateTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace("T", " ");
};

/*
=============================
        Extract Registration Number and Graduation Year 
=============================
*/
const extractRegistrationDetails = (email) => {
  const registrationNumber = email.match(/\d{8}/)[0];
  const graduationYear = parseInt(registrationNumber.substring(0, 4)) + 4;
  return { registrationNumber, graduationYear };
};

/*
=============================
        Register User 
=============================
*/
export const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    if (typeof next === "function") {
      return next(new ApiError("User already exists", 400));
    }
    throw new ApiError("User already exists", 400);
  }

  const { registrationNumber, graduationYear } =
    extractRegistrationDetails(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  // Debug log for registration values
  console.log({ email, password, hashedPassword });

  const newUser = await User.create({
    email,
    password: hashedPassword,
    registration_number: registrationNumber,
    graduation_year: graduationYear,
  });

  // Assign default role to new user
  const userRole = await Role.findOne({ where: { role_name: "user" } });
  if (userRole) {
    await UserRole.create({ user_id: newUser.id, role_id: userRole.role_id }); 
  }

  console.log(`New user registered at ${getCurrentUTCDateTime()}`);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { userId: newUser.id },
        "User registered successfully. You can now log in."
      )
    );
});

/*
=============================
        Login User 
=============================
*/
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email }, include: Role });
  if (!user) return next(new ApiError("Invalid email or password", 400));
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ApiError("Invalid email or password", 400));

  const roles = user.Roles.map((role) => role.role_name);
  const token = jwt.sign(
    { id: user.id, email: user.email, roles },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
  };
  if (isProduction) {
    cookieOptions.domain = "classmate-o06h.onrender.com";
  }
  res.cookie("token", token, cookieOptions);

  console.log(`User ${email} logged in at ${getCurrentUTCDateTime()}`);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { id: user.id, email: user.email, roles } },
        "Login successful"
      )
    );
});

/*
==============================
       Get Current User 
==============================
*/

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new ApiError("Not authenticated", 401));

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: Role,
  });
  if (!user) return next(new ApiError("User not found", 404));

  const roles = user.Roles.map((role) => role.role_name);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON(), roles } },
        "User retrieved successfully"
      )
    );
});

/*
==============================
       Update User 
==============================
*/
export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { name, semester, branch, hostel } = req.body;

  const user = await User.findByPk(userId, { include: Role });
  if (!user) return next(new ApiError("User not found", 404));

  if (name !== undefined) user.name = name;
  if (semester !== undefined) user.semester = semester;
  if (branch !== undefined) user.branch = branch;
  if (hostel !== undefined) user.hostel = hostel;

  await user.save();
  console.log(
    `User ${user.email} updated profile at ${getCurrentUTCDateTime()}`
  );

  // Reload user with roles to ensure associations are up-to-date
  const updatedUser = await User.findByPk(userId, { include: Role });
  const roles = updatedUser.Roles.map((role) => role.role_name);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...updatedUser.toJSON(), roles } },
        "User updated successfully"
      )
    );
});

/*
==============================
       Logout User 
==============================
*/
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  console.log(
    `User ${req.user.email} logged out at ${getCurrentUTCDateTime()}`
  );

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

/*
==============================
       Get User By ID
==============================
*/
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: Role,
  });

  if (!user) return next(new ApiError("User not found", 404));

  const roles = user.Roles.map((role) => role.role_name);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON(), roles } },
        "User fetched successfully"
      )
    );
});

/*
==============================
       Get All Users (Admin Only)
==============================
*/
export const getAllUsers = asyncHandler(async (req, res, next) => {
 
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, 
      include: {
        model: Role,
        attributes: ["role_name"],
        through: { attributes: [] }, 
      },
      order: [["id", "ASC"]], 
    });

    
    const formattedUsers = users.map((user) => {
      const userJSON = user.toJSON(); 
      userJSON.roles = userJSON.Roles.map((role) => role.role_name); // Create simple roles array
      delete userJSON.Roles; 
      return userJSON;
    });

  
    res.status(200).json(
      new ApiResponse(
        200,
        { users: formattedUsers },
        "All users retrieved successfully"
      )
    );
  } catch (error) {
 
    console.error("Error fetching all users:", error);
    return next(new ApiError("Failed to retrieve users", 500));
  }
});