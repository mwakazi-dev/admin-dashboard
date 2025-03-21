import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User";
import asyncHandler from "../utils/async-handler-utils";
import ApiError from "../utils/api-error-utils";
import { generateOTP, otpExpiresDate } from "../utils/otp-utils";
import { sendVerificationOTP } from "../config/email-config";
import { passwordRegex } from "../constants/regex";

export const userRegistrationController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    // check if user is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "Email already exists"));
    }

    if (!passwordRegex.test(password)) {
      console.log("Password validation failed:", password);
      return next(
        new ApiError(
          400,
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
      );
    }

    // hash the passwword
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // generate otp
    const otp = generateOTP();
    const otpExpires = otpExpiresDate;

    // save user
    const createdUser = await User.create({
      email,
      username,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    // generate jwt
    let idToken = jwt.sign(
      {
        _id: createdUser._id,
        email: createdUser.email,
        username: createdUser.username,
        isVerified: createdUser.isVerified,
        otp: createdUser.otp,
        otpExpires: createdUser.otpExpires,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1hr",
      }
    );

    await sendVerificationOTP(email, otp);

    res.status(201).json({
      success: true,
      idToken,
      message:
        "OTP sent to your email. Please verify to activate your account.",
    });
  }
);

export const userLoginController = async (req: Request, res: Response) => {};

export const verifyOTPController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body;

    if (req.user?.isVerified) {
      return res
        .status(200)
        .json({ success: true, message: "Email already verified" });
    }

    if (!req.user?.otp || req.user.otp !== otp) {
      return next(new ApiError(400, "Invalid OTP"));
    }

    if (new Date() > new Date(req.user.otpExpires)) {
      return next(new ApiError(400, "OTP expired. Please request a new one"));
    }

    const userRes = await User.findByIdAndUpdate(req.user._id, {
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    req.user = userRes;

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  }
);
