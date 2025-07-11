import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import dotenv from "dotenv";
import Subject from "../models/subject.model.js";
import UserSubject from "../models/user_subject.model.js";
dotenv.config();

console.log(process.env.CLIENT_URL)

const getCurrentUTCDateTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace("T", " ");
};

const extractRegistrationDetails = (email) => {
  const registrationNumber = email.match(/\d{8}/)[0];
  const graduationYear = parseInt(registrationNumber.substring(0, 4)) + 4;
  return { registrationNumber, graduationYear };
};

export const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    if (typeof next === "function") {
      return next(new ApiError("You already have an account. Please log in.", 400));
    }
    throw new ApiError("You already have an account. Please log in.", 400);
  }

  const { registrationNumber, graduationYear } =
    extractRegistrationDetails(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user with same registration number already exists
  const existingUserWithReg = await User.findOne({ where: { registration_number: registrationNumber } });
  if (existingUserWithReg) {
    return next(new ApiError("This user already exists. Please check your email or use a different email.", 400));
  }

  const newUser = await User.create({
    email,
    password: hashedPassword,
    registration_number: registrationNumber,
    graduation_year: graduationYear,
  });

  const defaultSubjects = [
    "Data Structure",
    "Operating System",
    "Mathematics",
    "Computer Networks",
    "Compiler Design"
  ];
  const subjectRecords = [];
  for (const subjectName of defaultSubjects) {
    const subjectCode = subjectName.toLowerCase().replace(/\s+/g, '_');
    const [subject] = await Subject.findOrCreate({
      where: { code: subjectCode },
      defaults: { name: subjectName, code: subjectCode }
    });
    subjectRecords.push(subject);
  }
  // Assign all subjects to the new user
  for (const subject of subjectRecords) {
    await UserSubject.findOrCreate({
      where: { userId: newUser.id, subjectId: subject.id }
    });
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

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return next(new ApiError("Email or password is wrong, re-enter.", 400));
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ApiError("Email or password is wrong, re-enter.", 400));

  const token = jwt.sign(
    { id: user.id, email: user.email },
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
        { user: { id: user.id, email: user.email } },
        "Login successful"
      )
    );
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new ApiError("Not authenticated", 401));

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) return next(new ApiError("User not found", 404));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON() } },
        "User retrieved successfully"
      )
    );
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { name, semester, branch, hostel } = req.body;

  const user = await User.findByPk(userId, { });
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
  const updatedUser = await User.findByPk(userId, { });
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...updatedUser.toJSON() } },
        "User updated successfully"
      )
    );
});

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

export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  if (!user) return next(new ApiError("User not found", 404));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON() } },
        "User fetched successfully"
      )
    );
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
 
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, 
      order: [["id", "ASC"]], 
    });

    
    const formattedUsers = users.map((user) => {
      const userJSON = user.toJSON(); 
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
