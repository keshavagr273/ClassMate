import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';


const emailMiddleware = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError("Email is required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError("Invalid email format", 400);
    }

    if (!email.toLowerCase().endsWith('@iiitsonepat.ac.in')) {
        throw new ApiError("Access denied. Only IIIT Sonepat students can access this service", 403);
    }

    req.validatedEmail = email.toLowerCase();
    next();
});

export default emailMiddleware;
