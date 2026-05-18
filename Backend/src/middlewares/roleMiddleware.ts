import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "admin" | "user";
  };
}

// roles parameter type
type UserRole = "admin" | "user";

export const allowRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, "Unauthorized"));
      }

      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError(403, "Access denied: insufficient permissions"),
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
