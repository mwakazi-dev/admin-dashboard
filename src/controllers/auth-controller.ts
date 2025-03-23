import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User";
import asyncHandler from "../utils/async-handler-utils";
import ApiError from "../utils/api-error-utils";
import { generateOTP, otpExpiresDate } from "../utils/otp-utils";
import {
  sendPasswordResetLink,
  sendVerificationOTP,
} from "../config/email-config";
import { passwordRegex } from "../constants/regex";

export const userRegistrationController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    // check if user is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new ApiError(400, "User already exists"));
    }

    if (!passwordRegex.test(password)) {
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
        role: createdUser.role,
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

export const userLoginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    // check if the user exists
    const user = await User.findOne({
      $or: [{ email: username }, { username: username }],
    });
    if (!user) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    // check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new ApiError(401, "Password is incorrect"));
    }
    // generate jwt
    let idToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1hr",
      }
    );

    // send jwt as response
    res.status(200).json({
      success: true,
      idToken,
      expiresIn: "1hr",
      message: "Login successful",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  }
);

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

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // check if the user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const { oldPassword, newPassword } = req.body;

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return next(new ApiError(400, "Old password is incorrect"));
    }

    if (!passwordRegex.test(newPassword)) {
      return next(
        new ApiError(
          400,
          "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
      );
    }

    // hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // update the password
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        _id: updatedUser?._id,
        username: updatedUser?.username,
        email: updatedUser?.email,
        isVerified: updatedUser?.isVerified,
        role: updatedUser?.role,
      },
    });
  }
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    // check if the user exists
    const user = await User.findOne({
      $or: [{ email: username }, { username }],
    });
    if (!user) {
      return next(new ApiError(404, "User not found."));
    }

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 Hour Expiry
    await user.save();

    // send reset password email
    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetLink(user.email, resetPasswordUrl);

    res.status(200).json({
      success: true,
      message: "Reset password email sent successfully",
    });
  }
);

export const verifyResetTokenController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetToken } = req.query;

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    res.status(200).json({ success: true, message: "Token is valid" });
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetToken, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (!passwordRegex.test(newPassword)) {
      return next(
        new ApiError(
          400,
          "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
);

export const updateUserRoleController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // destructure role and userId from req.body
    const { role, username } = req.body;

    // check if the user exists
    const user = await User.findOne({
      $or: [{ email: username }, { username }],
    });
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // check if the provided role is valid
    const validRoles = ["admin", "user"];
    if (!validRoles.includes(role)) {
      return next(new ApiError(400, "Invalid role"));
    }

    // update user role
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        role,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        _id: updatedUser?._id,
        username: updatedUser?.username,
        email: updatedUser?.email,
        isVerified: updatedUser?.isVerified,
        role: updatedUser?.role,
      },
    });
  }
);
