import { NextFunction, Request, Response } from "express";

import asyncHandler from "../utils/async-handler-utils";

const adminMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. You are not an admin." });
    }
    next();
  }
);

export default adminMiddleware;
