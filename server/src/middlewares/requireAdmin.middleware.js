import ApiError from '../utils/apiError.js';

/**
 * Middleware that restricts access to users with isAdmin === true.
 * Must be used AFTER authMiddleware (requires req.user to be populated).
 */
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new ApiError('Admin access required', 403);
  }
  next();
};

export default requireAdmin;
