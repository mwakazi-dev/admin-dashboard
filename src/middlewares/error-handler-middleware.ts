import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import ApiError from "../utils/api-error-utils";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ✅ Handle Mongoose Validation Errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // ✅ Handle MongoDB Duplicate Key Errors
  if (err.code === 11000) {
    statusCode = 400;
    message = `The ${Object.keys(err.keyValue)[0]} already exists.`;
  }

  // ✅ Handle JWT Errors
  if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token. Please authenticate again.";
  }

  // ✅ Handle Bcrypt Errors
  if (err.message && err.message.includes("bcrypt")) {
    statusCode = 500;
    message = "Internal server error during password encryption.";
  }

  // ✅ Handle Custom API Errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ✅ Log errors in development mode
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
