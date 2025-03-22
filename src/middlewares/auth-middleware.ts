import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import ApiError from "../utils/api-error-utils";
import asyncHandler from "../utils/async-handler-utils";

const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new ApiError(401, "Unauthorized. Please login."));
    }
    // verify token
    const decodedUser: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );
    if (!decodedUser) {
      return next(new ApiError(403, "Invalid token. Please login again."));
    }

    req.user = decodedUser;
    next();
  }
);

export default authMiddleware;
